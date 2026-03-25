package com.zud.backend.domain.auth.client;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.zud.backend.common.config.properties.AuthProperties;
import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.auth.converter.AuthConverter;
import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.request.TokenIssueReqDto;
import com.zud.backend.domain.auth.dto.request.TokenRefreshReqDto;
import com.zud.backend.domain.auth.dto.request.TokenRevokeReqDto;
import com.zud.backend.domain.auth.dto.response.TokenIssueResDto;
import com.zud.backend.domain.auth.exception.AuthException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AuthServerClient {

	private final RestClient restClient;
	private final AuthProperties authProperties;

	public AuthServerClient(final AuthProperties authProperties) {
		this.authProperties = authProperties;
		this.restClient = RestClient.builder()
			.baseUrl(authProperties.serverUrl())
			.build();
	}

	public TokenIssueResDto issueToken(final LoginReqDto reqDto) {
		TokenIssueReqDto tokenIssueReqDto = AuthConverter.toTokenIssueReqDto(reqDto);

		try {
			TokenIssueResDto response = restClient.post()
				.uri(authProperties.issuePath())
				.contentType(MediaType.APPLICATION_JSON)
				.body(tokenIssueReqDto)
				.retrieve()
				.body(TokenIssueResDto.class);

			if (response == null || response.accessToken() == null || response.refreshToken() == null) {
				throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
			}
			return response;
		} catch (Exception e) {
			log.error("[AuthServerClient] 토큰 발급 실패 - employeeNumber: {}", reqDto.employeeNumber(), e);
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
	}

	public TokenIssueResDto reissueToken(final String refreshToken) {
		TokenRefreshReqDto tokenRefreshReqDto = AuthConverter.toTokenRefreshReqDto(refreshToken);

		try {
			TokenIssueResDto response = restClient.post()
				.uri(authProperties.reissuePath())
				.contentType(MediaType.APPLICATION_JSON)
				.body(tokenRefreshReqDto)
				.retrieve()
				.body(TokenIssueResDto.class);

			if (response == null || response.accessToken() == null || response.refreshToken() == null) {
				throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
			}
			return response;
		} catch (Exception _) {
			log.error("[AuthServerClient] 토큰 재발급 실패)");
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
	}

	public boolean isBlacklisted(final String jti) {
		try {
			Boolean result = restClient.get()
				.uri(authProperties.blacklistPath(), jti)
				.retrieve()
				.body(Boolean.class);
			return Boolean.TRUE.equals(result);
		} catch (Exception e) {
			log.error("[AuthServerClient] 블랙리스트 확인 실패 - jti: {}", jti, e);
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
	}

	public void revokeToken(final String accessToken, final String reason) {
		TokenRevokeReqDto reqDto = new TokenRevokeReqDto(accessToken, reason);

		try {
			restClient.post()
				.uri(authProperties.revokePath())
				.contentType(MediaType.APPLICATION_JSON)
				.body(reqDto)
				.retrieve()
				.toBodilessEntity();
		} catch (Exception e) {
			log.error("[AuthServerClient] 토큰 무효화 실패", e);
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
	}
}
