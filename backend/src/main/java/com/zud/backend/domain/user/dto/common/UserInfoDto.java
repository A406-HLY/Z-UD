package com.zud.backend.domain.user.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "사용자 기본 정보 DTO")
@Builder
public record UserInfoDto(
	@Schema(description = "사용자 ID", example = "1")
	Long userId,
	@Schema(description = "사원 번호", example = "EMP001")
	String employeeNumber,
	@Schema(description = "사용자 이름", example = "홍길동")
	String name
) {
}
