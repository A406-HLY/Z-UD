package com.bank.auth.conveter;

import com.bank.auth.dto.response.TokenIssueResDto;
import com.bank.user.entity.User;

import lombok.experimental.UtilityClass;

@UtilityClass
public class TokenConverter {

	public TokenIssueResDto toTokenIssueResDto(
		final String accessToken,
		final String refreshToken,
		final Long accessTokenTtlSeconds,
		final User user
	) {
		return TokenIssueResDto.builder()
			.accessToken(accessToken)
			.refreshToken(refreshToken)
			.expiresIn(accessTokenTtlSeconds)
			.userId(user.getId())
			.name(user.getName())
			.employeeNumber(user.getEmployeeNumber())
			.branchId(user.getBranchId())
			.build();
	}

	public TokenIssueResDto toTokenIssueResDto(
		final String accessToken,
		final String refreshToken,
		final Long accessTokenTtlSeconds
	) {
		return TokenIssueResDto.builder()
			.accessToken(accessToken)
			.refreshToken(refreshToken)
			.expiresIn(accessTokenTtlSeconds)
			.build();
	}
}
