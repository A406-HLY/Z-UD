package com.zud.backend.domain.document.dto.response.file;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "Presigned PUT URL 발급 응답 DTO")
public record PresignedUrlResDto(
	@Schema(description = "파일별 Presigned URL 목록")
	List<PresignedFileDto> files
) {
}
