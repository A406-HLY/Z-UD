package com.zud.backend.domain.auth.dto.request;

public record TokenRevokeReqDto(
	String accessToken,
	String reason
) {
}
