package com.zud.backend.domain.user.dto.common;

import lombok.Builder;

@Builder
public record UserInfoDto(
	Long userId,
	String employeeNumber,
	String name
) {
}
