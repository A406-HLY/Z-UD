package com.zud.backend.domain.document.service.facade;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.enums.CounselStatus;
import com.zud.backend.domain.consultation.service.ConsultationStatusService;
import com.zud.backend.domain.consultation.service.query.ConsultationQueryService;
import com.zud.backend.domain.document.converter.DocumentConverter;
import com.zud.backend.domain.document.dto.message.OcrReqMessage;
import com.zud.backend.domain.document.dto.request.DocumentExtractionReqDto;
import com.zud.backend.domain.document.dto.request.file.FileMetaDto;
import com.zud.backend.domain.document.dto.request.file.PresignedUrlReqDto;
import com.zud.backend.domain.document.dto.request.file.UploadCompletionReqDto;
import com.zud.backend.domain.document.dto.request.file.UploadResultDto;
import com.zud.backend.domain.document.dto.response.DocumentExtractionResDto;
import com.zud.backend.domain.document.dto.response.DocumentValidationResult;
import com.zud.backend.domain.document.dto.response.file.PresignedFileDto;
import com.zud.backend.domain.document.dto.response.file.PresignedUrlResDto;
import com.zud.backend.domain.document.dto.response.file.UploadCompletionResDto;
import com.zud.backend.domain.document.service.cloudflare.CloudflareService;
import com.zud.backend.domain.document.service.kafka.OcrKafkaProducer;
import com.zud.backend.domain.document.service.query.DocumentExtractionQueryService;
import com.zud.backend.domain.document.validator.DocumentValidator;
import com.zud.backend.domain.document.validator.FileValidator;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentFacadeServiceImpl implements DocumentFacadeService {

	private static final long UPLOAD_TIMEOUT_SECONDS = 60;
	public static final int DEFAULT_EXPIRES_IN = 600;
	private final Executor applicationTaskExecutor;

	private final ConsultationStatusService consultationStatusService;
	private final ConsultationQueryService consultationQueryService;

	private final CloudflareService cloudflareService;
	private final OcrKafkaProducer ocrKafkaProducer;
	private final DocumentExtractionQueryService documentExtractionQueryService;

	private final FileValidator fileValidator;
	private final DocumentValidator documentValidator;

	@Override
	public void uploadFiles(final List<MultipartFile> files, final String consultationId) {
		try {
			consultationStatusService.updateDocumentVerificationStatus(consultationId, CounselStatus.UPLOADING, null);

			files.forEach(fileValidator::validateFile);

			List<CompletableFuture<String>> futures = files.stream()
				.map(file -> uploadSingleFile(file, consultationId))
				.toList();

			List<String> uploadedUrls = CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new))
				.thenApply(_ -> futures.stream()
					.map(CompletableFuture::join)
					.sorted()
					.toList())
				.orTimeout(UPLOAD_TIMEOUT_SECONDS, TimeUnit.SECONDS)
				.join();

			consultationStatusService.updateDocumentVerificationStatus(consultationId, CounselStatus.OCR_QUEUED,
				uploadedUrls);
			log.info("[Document] 다중 파일 업로드 완료: consultationId={}, count={}", consultationId, uploadedUrls.size());
		} catch (Exception e) {
			log.error("[Document] 파일 업로드 실패: consultationId={}", consultationId, e);
			consultationStatusService.updateDocumentVerificationStatus(consultationId, CounselStatus.FAILED, List.of());
		}
	}

	@Override
	@Transactional(readOnly = true)
	public DocumentExtractionResDto validateDocuments(final DocumentExtractionReqDto reqDto) {
		Consultation consultation = consultationQueryService.findByUuid(reqDto.consultationId());
		DocumentValidationResult validationResult = documentValidator.validateAll(reqDto.documents(), consultation);
		return DocumentConverter.toDocumentExtractionDesDto(validationResult, reqDto.documents());
	}

	@Override
	@Transactional(readOnly = true)
	public DocumentExtractionResDto getExtractionResult(final String consultationId) {
		return documentExtractionQueryService.getExtractionResult(consultationId);
	}

	@Override
	public PresignedUrlResDto issuePresignedUrls(final PresignedUrlReqDto reqDto) {
		consultationQueryService.findByUuid(reqDto.consultationId());

		List<PresignedFileDto> presignedFiles = reqDto.files().stream()
			.map(fileMeta -> generatePresignedFile(reqDto.consultationId(), fileMeta))
			.toList();

		log.info("[Document] Presigned URL 발급 완료: consultationId={}, count={}",
			reqDto.consultationId(), presignedFiles.size());

		return DocumentConverter.toPresignedUrlResDto(presignedFiles);
	}

	@Override
	public UploadCompletionResDto completeUpload(final String consultationId, final UploadCompletionReqDto reqDto) {
		consultationQueryService.findByUuid(consultationId);

		Map<Boolean, List<UploadResultDto>> partitioned = reqDto.uploadedFiles().stream()
			.collect(Collectors.partitioningBy(UploadResultDto::success));

		List<String> successFileNames = partitioned.get(true).stream()
			.map(UploadResultDto::fileName)
			.toList();

		List<String> failedFileNames = partitioned.get(false).stream()
			.map(UploadResultDto::fileName)
			.toList();

		CounselStatus status;
		if (successFileNames.isEmpty()) {
			status = CounselStatus.FAILED;
			consultationStatusService.updateDocumentVerificationStatus(consultationId, status, List.of());
		} else {
			status = CounselStatus.OCR_QUEUED;
			List<String> documentUrls = successFileNames.stream()
				.map(fileName -> cloudflareService.generateGetPresignedUrl(consultationId, fileName))
				.toList();
			OcrReqMessage requestMessage = new OcrReqMessage(consultationId, documentUrls);
			ocrKafkaProducer.sendRequest(consultationId, requestMessage);
			consultationStatusService.updateDocumentVerificationStatus(consultationId, status, successFileNames);
		}

		log.info("[Document] 업로드 완료 처리: consultationId={}, success={}, failed={}",
			consultationId, successFileNames.size(), failedFileNames.size());

		return DocumentConverter.toUploadCompletionResDto(
			consultationId,
			status,
			successFileNames.size(),
			failedFileNames);
	}

	private PresignedFileDto generatePresignedFile(final String consultationId, final FileMetaDto fileMeta) {
		fileValidator.validateMeta(fileMeta);

		String presignedUrl = cloudflareService.generatePutPresignedUrl(consultationId, fileMeta);

		return DocumentConverter.toPresignedFileDto(fileMeta.fileName(), presignedUrl, DEFAULT_EXPIRES_IN);
	}

	private CompletableFuture<String> uploadSingleFile(final MultipartFile file, final String dirName) {
		return CompletableFuture.supplyAsync(
			() -> cloudflareService.uploadFile(file, dirName), applicationTaskExecutor);
	}

}
