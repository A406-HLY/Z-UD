package com.zud.backend.domain.audit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record MyDataReqDto(
	@Schema(description = "고객명", example = "홍길동")
	@NotBlank(message = "customerName 값은 필수입니다.")
	String customerName
) {
}
