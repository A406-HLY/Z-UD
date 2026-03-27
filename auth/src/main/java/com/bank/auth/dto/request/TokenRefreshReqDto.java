package com.bank.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Schema(description = "토큰 갱신 요청 DTO")
@Builder
public record TokenRefreshReqDto(
	@Schema(description = "리프레시 토큰")
	@NotBlank(message = "리프레시 토큰은 필수 입력값입니다.")
	String refreshToken
) {
}
