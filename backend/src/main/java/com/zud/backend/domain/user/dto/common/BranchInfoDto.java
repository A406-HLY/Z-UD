package com.zud.backend.domain.user.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "지점 정보 DTO")
@Builder
public record BranchInfoDto(
	@Schema(description = "지점 ID", example = "1")
	Long id,
	@Schema(description = "지점명", example = "강남지점")
	String name
) {
}
