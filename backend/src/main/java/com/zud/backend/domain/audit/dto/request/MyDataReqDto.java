package com.zud.backend.domain.audit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record MyDataReqDto(

	@Schema(description = "고객 이메일 주소", example = "zud@ssafy.co.kr")
	@NotBlank(message = "email 값은 필수입니다.")
	String email

) {
}
