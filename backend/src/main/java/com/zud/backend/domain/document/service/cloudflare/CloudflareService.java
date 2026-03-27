package com.zud.backend.domain.document.service.cloudflare;

import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.domain.document.dto.request.file.FileMetaDto;

public interface CloudflareService {
	String uploadFile(final MultipartFile file, final String directory);

	String generatePutPresignedUrl(final String consultationId, final FileMetaDto fileMeta);

	String generateGetPresignedUrl(final String consultationId, final String fileName);

	String findLatestRuleTitle(final String directory);

	void uploadFileWithKey(final MultipartFile file, final String key);

	String generateRuleGetPresignedUrl(final String key);
}
