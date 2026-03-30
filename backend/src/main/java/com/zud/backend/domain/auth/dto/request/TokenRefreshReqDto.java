package com.zud.backend.domain.auth.dto.request;

import lombok.Builder;

@Builder
public record TokenRefreshReqDto(
	String refreshToken
) {
}
