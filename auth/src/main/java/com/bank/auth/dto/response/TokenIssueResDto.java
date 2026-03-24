package com.bank.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "토큰 발급 응답 DTO")
@Builder
public record TokenIssueResDto(
	@Schema(description = "액세스 토큰")
	String accessToken,

	@Schema(description = "리프레시 토큰")
	String refreshToken,

	@Schema(description = "액세스 토큰 만료 시간 (초)", example = "3600")
	Long expiresIn
) {
}
