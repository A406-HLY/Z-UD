package com.zud.backend.domain.document.service.facade;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.domain.counsel.enums.CounselStatus;
import com.zud.backend.domain.counsel.service.CounselStatusService;
import com.zud.backend.domain.document.service.cloudflare.CloudflareService;
import com.zud.backend.domain.document.validator.FileValidator;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentFacadeServiceImpl implements DocumentFacadeService {

	private static final long UPLOAD_TIMEOUT_SECONDS = 60;

	private final CloudflareService cloudflareService;
	private final CounselStatusService counselStatusService;
	private final FileValidator fileValidator;
	private final Executor applicationTaskExecutor;

	@Async
	@Override
	public void uploadFiles(final List<MultipartFile> files, final Long userId, final Long counselId) {
		String dirName = generateDirName(userId, counselId);
		try {
			counselStatusService.updateDocumentVerificationStatus(dirName, CounselStatus.UPLOADING, null);

			files.forEach(fileValidator::validateFile);

			List<CompletableFuture<String>> futures = files.stream()
				.map(file -> uploadSingleFile(file, dirName))
				.toList();

			List<String> uploadedUrls = CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new))
				.thenApply(_ -> futures.stream()
					.map(CompletableFuture::join)
					.sorted()
					.toList())
				.orTimeout(UPLOAD_TIMEOUT_SECONDS, TimeUnit.SECONDS)
				.join();

			counselStatusService.updateDocumentVerificationStatus(dirName, CounselStatus.OCR_QUEUED, uploadedUrls);
			log.info("[Document] 다중 파일 업로드 완료: dirName={}, count={}", dirName, uploadedUrls.size());
		} catch (Exception e) {
			log.error("[Document] 파일 업로드 실패: dirName={}", dirName, e);
			counselStatusService.updateDocumentVerificationStatus(dirName, CounselStatus.FAILED, List.of());
		}
	}

	private CompletableFuture<String> uploadSingleFile(final MultipartFile file, final String dirName) {
		return CompletableFuture.supplyAsync(
			() -> cloudflareService.uploadFile(file, dirName), applicationTaskExecutor);
	}

	private String generateDirName(final Long userId, final Long counselId) {
		return userId + "/" + counselId;
	}
}
