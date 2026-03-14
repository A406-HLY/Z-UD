package com.zud.backend.domain.document.service.cloudflare;

import org.springframework.web.multipart.MultipartFile;

public interface CloudflareService {
	String uploadFile(final MultipartFile file, final String directory);
}
