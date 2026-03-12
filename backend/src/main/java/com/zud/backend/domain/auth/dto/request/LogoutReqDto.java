package com.zud.backend.domain.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Schema(description = "로그아웃 요청 DTO")
@Builder
public record LogoutReqDto(
	@Schema(description = "세션 ID", example = "abc123def456")
	@NotBlank(message = "Session ID는 필수 값 입니다.")
	String sessionId
) {
}
