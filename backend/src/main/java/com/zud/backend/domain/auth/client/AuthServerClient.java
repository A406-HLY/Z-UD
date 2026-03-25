package com.zud.backend.domain.auth.client;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

	private static final String OPERATION_ISSUE = "issue";
	private static final String OPERATION_REISSUE = "reissue";
	private static final String OPERATION_BLACKLIST = "blacklist";
	private static final String OPERATION_REVOKE = "revoke";

	private final RestClient restClient;
	private final AuthProperties authProperties;
	private final ObjectMapper objectMapper;

	public AuthServerClient(final AuthProperties authProperties, final ObjectMapper objectMapper) {
		this.authProperties = authProperties;
		this.objectMapper = objectMapper;
		this.restClient = RestClient.builder()
			.baseUrl(authProperties.serverUrl())
			.build();
	}

	public TokenIssueResDto issueToken(final LoginReqDto reqDto) {
		TokenIssueReqDto tokenIssueReqDto = AuthConverter.toTokenIssueReqDto(reqDto);

		try {
			String body = restClient.post()
				.uri(authProperties.issuePath())
				.contentType(MediaType.APPLICATION_JSON)
				.body(tokenIssueReqDto)
				.retrieve()
				.body(String.class);

			return parseTokenIssueResponse(body);
		} catch (RestClientResponseException e) {
			ErrorCode errorCode = resolveErrorCode(e, OPERATION_ISSUE);
			log.error("[AuthServerClient] 토큰 발급 실패 - employeeNumber: {}, status: {}, code: {}",
				reqDto.employeeNumber(), e.getStatusCode().value(), errorCode.getCode(), e);
			throw new AuthException(errorCode);
		} catch (IOException | RestClientException e) {
			log.error("[AuthServerClient] 토큰 발급 응답 파싱/통신 실패 - employeeNumber: {}", reqDto.employeeNumber(), e);
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
	}

	public TokenIssueResDto reissueToken(final String refreshToken) {
		TokenRefreshReqDto tokenRefreshReqDto = AuthConverter.toTokenRefreshReqDto(refreshToken);

		try {
			String body = restClient.post()
				.uri(authProperties.reissuePath())
				.contentType(MediaType.APPLICATION_JSON)
				.body(tokenRefreshReqDto)
				.retrieve()
				.body(String.class);

			return parseTokenIssueResponse(body);
		} catch (RestClientResponseException e) {
			ErrorCode errorCode = resolveErrorCode(e, OPERATION_REISSUE);
			log.error("[AuthServerClient] 토큰 재발급 실패 - status: {}, code: {}",
				e.getStatusCode().value(), errorCode.getCode(), e);
			throw new AuthException(errorCode);
		} catch (IOException | RestClientException e) {
			log.error("[AuthServerClient] 토큰 재발급 응답 파싱/통신 실패", e);
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
	}

	public boolean isBlacklisted(final String jti) {
		try {
			String body = restClient.get()
				.uri(authProperties.blacklistPath(), jti)
				.retrieve()
				.body(String.class);
			return parseBlacklistResponse(body);
		} catch (RestClientResponseException e) {
			ErrorCode errorCode = resolveErrorCode(e, OPERATION_BLACKLIST);
			log.error("[AuthServerClient] 블랙리스트 확인 실패 - jti: {}, status: {}, code: {}",
				jti, e.getStatusCode().value(), errorCode.getCode(), e);
			throw new AuthException(errorCode);
		} catch (IOException | RestClientException e) {
			log.error("[AuthServerClient] 블랙리스트 확인 응답 파싱/통신 실패 - jti: {}", jti, e);
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
		} catch (RestClientResponseException e) {
			ErrorCode errorCode = resolveErrorCode(e, OPERATION_REVOKE);
			log.error("[AuthServerClient] 토큰 무효화 실패 - status: {}, code: {}",
				e.getStatusCode().value(), errorCode.getCode(), e);
			throw new AuthException(errorCode);
		} catch (RestClientException e) {
			log.error("[AuthServerClient] 토큰 무효화 통신 실패", e);
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
	}

	private TokenIssueResDto parseTokenIssueResponse(final String body) throws IOException {
		JsonNode payloadNode = unwrapDataNode(body);
		TokenIssueResDto response = objectMapper.treeToValue(payloadNode, TokenIssueResDto.class);
		if (response == null || response.accessToken() == null || response.refreshToken() == null) {
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
		return response;
	}

	private boolean parseBlacklistResponse(final String body) throws IOException {
		JsonNode payloadNode = unwrapDataNode(body);
		if (payloadNode.isBoolean()) {
			return payloadNode.booleanValue();
		}
		Boolean result = objectMapper.treeToValue(payloadNode, Boolean.class);
		return Boolean.TRUE.equals(result);
	}

	private JsonNode unwrapDataNode(final String body) throws IOException {
		if (body == null || body.isBlank()) {
			throw new AuthException(ErrorCode.AUTH_SERVER_ERROR);
		}
		JsonNode root = objectMapper.readTree(body);
		if (root.hasNonNull("data")) {
			return root.get("data");
		}
		return root;
	}

	private ErrorCode resolveErrorCode(final RestClientResponseException e, final String operation) {
		ErrorCode errorCodeByBody = resolveErrorCodeByBody(e.getResponseBodyAsString());
		if (errorCodeByBody != null) {
			return errorCodeByBody;
		}

		return switch (e.getStatusCode().value()) {
			case 401 -> OPERATION_ISSUE.equals(operation) ? ErrorCode.INVALID_CREDENTIALS : ErrorCode.TOKEN_INVALID;
			case 403 -> ErrorCode.ACCOUNT_LOCKED;
			case 404 -> ErrorCode.TOKEN_NOT_FOUND;
			default -> ErrorCode.AUTH_SERVER_ERROR;
		};
	}

	private ErrorCode resolveErrorCodeByBody(final String body) {
		if (body == null || body.isBlank()) {
			return null;
		}

		try {
			JsonNode root = objectMapper.readTree(body);
			String rawCode = null;
			if (root.hasNonNull("code")) {
				rawCode = root.get("code").asText();
			} else if (root.has("error") && root.get("error").hasNonNull("code")) {
				rawCode = root.get("error").get("code").asText();
			}

			if (rawCode == null || rawCode.isBlank()) {
				return null;
			}

			return switch (rawCode) {
				case "US-001" -> ErrorCode.INVALID_CREDENTIALS;
				case "US-002" -> ErrorCode.ACCOUNT_LOCKED;
				case "AU-001" -> ErrorCode.TOKEN_INVALID;
				case "AU-003" -> ErrorCode.TOKEN_NOT_FOUND;
				default -> null;
			};
		} catch (IOException _) {
			return null;
		}
	}
}
