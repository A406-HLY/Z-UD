package com.zud.backend.domain.document.service.facade;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.enums.CounselStatus;
import com.zud.backend.domain.consultation.service.ConsultationStatusService;
import com.zud.backend.domain.consultation.service.query.ConsultationQueryService;
import com.zud.backend.domain.document.converter.DocumentConverter;
import com.zud.backend.domain.document.dto.request.request.DocumentExtractionReqDto;
import com.zud.backend.domain.document.dto.response.DocumentExtractionDesDto;
import com.zud.backend.domain.document.dto.response.DocumentValidationResult;
import com.zud.backend.domain.document.service.cloudflare.CloudflareService;
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
	private final Executor applicationTaskExecutor;

	private final ConsultationStatusService consultationStatusService;
	private final ConsultationQueryService consultationQueryService;

	private final CloudflareService cloudflareService;

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
			log.info("[Document] 다중 파일 업로드 완료: counselId={}, count={}", consultationId, uploadedUrls.size());
		} catch (Exception e) {
			log.error("[Document] 파일 업로드 실패: counselId={}", consultationId, e);
			consultationStatusService.updateDocumentVerificationStatus(consultationId, CounselStatus.FAILED, List.of());
		}
	}

	@Override
	@Transactional(readOnly = true)
	public DocumentExtractionDesDto validateDocuments(final DocumentExtractionReqDto reqDto) {
		Consultation consultation = consultationQueryService.findByUuid(reqDto.caseId());
		DocumentValidationResult validationResult = documentValidator.validateAll(reqDto.documents(), consultation);
		return DocumentConverter.toDocumentExtractionDesDto(validationResult, reqDto.documents());
	}

	private CompletableFuture<String> uploadSingleFile(final MultipartFile file, final String dirName) {
		return CompletableFuture.supplyAsync(
			() -> cloudflareService.uploadFile(file, dirName), applicationTaskExecutor);
	}

}
