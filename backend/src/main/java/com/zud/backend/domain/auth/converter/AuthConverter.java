package com.zud.backend.domain.auth.converter;

import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.request.TokenIssueReqDto;
import com.zud.backend.domain.auth.dto.request.TokenRefreshReqDto;
import com.zud.backend.domain.auth.dto.response.SsoTokenResDto;
import com.zud.backend.domain.auth.dto.response.TokenIssueResDto;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.user.converter.UserConverter;

import lombok.experimental.UtilityClass;

@UtilityClass
public class AuthConverter {

	public TokenIssueReqDto toTokenIssueReqDto(final LoginReqDto reqDto) {
		return TokenIssueReqDto.builder()
			.employeeNumber(reqDto.employeeNumber())
			.password(reqDto.password())
			.build();
	}

	public TokenRefreshReqDto toTokenRefreshReqDto(final String refreshToken) {
		return TokenRefreshReqDto.builder()
			.refreshToken(refreshToken)
			.build();
	}

	public TokenIssueResDto toTokenIssuanceResDto(final SsoTokenResDto tokenDto, final Branch branch) {
		return TokenIssueResDto.builder()
			.userInfoDto(UserConverter.toUserInfoDto(tokenDto))
			.branchInfoDto(UserConverter.toBranchInfoDto(branch))
			.expiresIn(tokenDto.expiresIn())
			.build();
	}
}
