package com.zud.backend.domain.user.dto.common;

import lombok.Builder;

@Builder
public record BranchInfoDto(
	Long id,
	String name
) {
}
