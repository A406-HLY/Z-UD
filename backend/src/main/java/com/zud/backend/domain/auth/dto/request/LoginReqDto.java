package com.zud.backend.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
//TODO Http Message Body 암호화 기술 적용 필요
public record LoginReqDto(
	@NotBlank(message = "사원 번호는 필수 입력값 입니다.")
	String employeeNumber,
	@NotBlank(message = "비밀번호는 필수 입력값 입니다.")
	String password
) {
}
