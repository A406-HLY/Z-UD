package com.zud.backend.domain.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Schema(description = "로그인 요청 DTO")
@Builder
public record LoginReqDto(
	@Schema(description = "사원 번호", example = "ZUD144001")
	@NotBlank(message = "사원 번호는 필수 입력값 입니다.")
	String employeeNumber,

	@Schema(description = "비밀번호", example = "password123", format = "password")
	@NotBlank(message = "비밀번호는 필수 입력값 입니다.")
	String password
) {
}
