package com.zud.backend.domain.document.dto.response.file;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "Presigned URL 발급 파일 항목 DTO")
public record PresignedFileDto(
	@Schema(description = "파일명", example = "income_certificate.pdf")
	String fileName,
	@Schema(description = "파일 업로드용 Presigned PUT URL", example = "https://example.r2.cloudflarestorage.com/..." )
	String presignedUrl,
	@Schema(description = "URL 만료 시간(초)", example = "300")
	int expiresIn
) {
}
