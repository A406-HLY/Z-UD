package com.zud.backend.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record LogoutReqDto(
	@NotBlank(message = "Session ID는 필수 값 입니다.")
	String sessionId
) {
}
