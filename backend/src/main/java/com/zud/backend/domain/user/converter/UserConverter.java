package com.zud.backend.domain.user.converter;

import com.zud.backend.domain.auth.dto.response.TokenIssueResDto;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.user.dto.common.BranchInfoDto;
import com.zud.backend.domain.user.dto.common.UserInfoDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class UserConverter {
	public UserInfoDto toUserInfoDto(final TokenIssueResDto issueResDto) {
		return UserInfoDto.builder()
			.userId(issueResDto.userId())
			.employeeNumber(issueResDto.employeeNumber())
			.name(issueResDto.name())
			.build();
	}

	public BranchInfoDto toBranchInfoDto(final Branch branch) {
		return BranchInfoDto.builder()
			.id(branch.getId())
			.name(branch.getName())
			.build();
	}
}
