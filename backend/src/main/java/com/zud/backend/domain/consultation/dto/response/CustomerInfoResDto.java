package com.zud.backend.domain.consultation.dto.response;

import lombok.Builder;

@Builder
public record CustomerInfoResDto(
	Long id,
	String name
) {
}
