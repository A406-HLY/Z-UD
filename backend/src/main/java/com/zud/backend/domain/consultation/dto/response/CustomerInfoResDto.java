package com.zud.backend.domain.consultation.dto.response;

import lombok.Builder;

@Builder
public record CustomerInfoResDto(
	String id,
	String name
) {
}
