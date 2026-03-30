package com.zud.backend.domain.document.dto.request.file;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "업로드 완료 결과 항목 DTO")
public record UploadResultDto(
	@Schema(description = "업로드 파일명", example = "2025_03_29_11_30.pdf")
	@NotBlank(message = "파일명은 필수입니다.")
	String fileName,
	@Schema(description = "업로드 성공 여부", example = "true")
	Boolean success
) {
}
