package com.zud.backend.domain.user.converter;

import com.zud.backend.domain.user.dto.common.BranchInfoDto;
import com.zud.backend.domain.user.dto.common.UserInfoDto;
import com.zud.backend.domain.user.entity.User;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserConverter {
	public UserInfoDto toUserInfoDto(final User user) {
		return UserInfoDto.builder()
			.userId(user.getId())
			.employeeNumber(user.getEmployeeNumber())
			.name(user.getName())
			.build();
	}

	public BranchInfoDto toBranchInfoDto(final User user) {
		return BranchInfoDto.builder()
			.id(user.getBranch().getId())
			.name(user.getBranch().getName())
			.build();
	}
}
