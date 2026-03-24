package com.zud.backend.domain.document.service.cloudflare;

import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.domain.document.dto.request.file.FileMetaDto;

public interface CloudflareService {
	String uploadFile(final MultipartFile file, final String directory);

	String generatePutPresignedUrl(final String consultationId, final FileMetaDto fileMeta);
}
