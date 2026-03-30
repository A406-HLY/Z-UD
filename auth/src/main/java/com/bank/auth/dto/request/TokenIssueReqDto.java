package com.bank.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Schema(description = "토큰 발급 요청 DTO")
@Builder
public record TokenIssueReqDto(
	@Schema(description = "사원 번호", example = "ZUD144001")
	@NotBlank(message = "사원 번호는 필수 입력값 입니다.")
	String employeeNumber,

	@Schema(description = "비밀번호", example = "password123", format = "password")
	@NotBlank(message = "비밀번호는 필수 입력값 입니다.")
	String password
) {
}
