package com.bank.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Schema(description = "토큰 무효화 요청 DTO")
@Builder
public record TokenRevokeReqDto(
	@Schema(description = "무효화할 액세스 토큰")
	@NotBlank(message = "액세스 토큰은 필수 입력값입니다.")
	String accessToken,

	@Schema(description = "무효화 사유", example = "LOGOUT")
	String reason
) {
}
