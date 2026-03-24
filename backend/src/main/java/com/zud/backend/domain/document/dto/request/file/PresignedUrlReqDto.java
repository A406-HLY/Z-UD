package com.zud.backend.domain.document.dto.request.file;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

@Schema(description = "Presigned URL 발급 요청 DTO")
public record PresignedUrlReqDto(
	@Schema(description = "상담 ID", example = "290b84d9-657e-4341-8b84-d9657e434133")
	@NotBlank(message = "상담 ID는 필수입니다.")
	String consultationId,

	@Schema(description = "업로드할 파일 메타데이터 목록")
	@NotEmpty(message = "최소 1개 이상의 파일 정보가 필요합니다.")
	@Valid List<FileMetaDto> files
) {
}
