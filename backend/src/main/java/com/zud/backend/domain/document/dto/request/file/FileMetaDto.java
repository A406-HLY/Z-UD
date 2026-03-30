package com.zud.backend.domain.document.dto.request.file;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Schema(description = "Presigned URL 발급 요청 파일 메타 정보 DTO")
public record FileMetaDto(
	@Schema(description = "원본 파일명", example = "income_certificate.pdf")
	@NotBlank(message = "파일명은 필수입니다.")
	String fileName,

	@Schema(description = "파일 MIME 타입", example = "application/pdf")
	@NotBlank(message = "파일 타입은 필수입니다.")
	String contentType,

	@Schema(description = "파일 크기(byte)", example = "245760")
	@Positive(message = "파일 크기는 0보다 커야 합니다.")
	Long fileSize
) {
}
