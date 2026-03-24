package com.bank.auth.conveter;

import com.bank.auth.dto.response.TokenIssueResDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class TokenConverter {

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
