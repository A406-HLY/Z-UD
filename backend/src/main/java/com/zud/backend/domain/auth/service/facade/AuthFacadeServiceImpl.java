package com.zud.backend.domain.auth.service.facade;

import static org.springframework.http.HttpHeaders.*;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.util.CookieUtils;
import com.zud.backend.domain.auth.client.AuthServerClient;
import com.zud.backend.domain.auth.converter.AuthConverter;
import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.response.LoginSuccessResDto;
import com.zud.backend.domain.auth.dto.response.TokenIssueResDto;
import com.zud.backend.domain.auth.exception.AuthException;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.branch.service.query.BranchQueryService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthFacadeServiceImpl implements AuthFacadeService {

	private static final String BEARER_PREFIX = "Bearer ";
	private static final String LOGOUT_REASON = "USER_LOGOUT";

	private final AuthServerClient authServerClient;
	private final BranchQueryService branchQueryService;

	@Override
	@Transactional
	public LoginSuccessResDto login(final LoginReqDto reqDto, final HttpServletResponse servletResponse) {
		TokenIssueResDto tokenDto = authServerClient.issueToken(reqDto);
		Branch branch = branchQueryService.findById(tokenDto.branchId());
		applyTokenToResponse(servletResponse, tokenDto);
		return AuthConverter.toLoginSuccessDto(tokenDto, branch);
	}

	@Override
	@Transactional
	public TokenIssueResDto reissue(final HttpServletRequest servletRequest) {
		String refreshToken = CookieUtils.extractRefreshToken(servletRequest)
			.orElseThrow(() -> new AuthException(ErrorCode.TOKEN_NOT_FOUND));
		return authServerClient.reissueToken(refreshToken);
	}

	@Override
	@Transactional
	public void logout(final HttpServletRequest servletRequest, final HttpServletResponse servletResponse) {
		extractBearerToken(servletRequest)
			.ifPresent(accessToken -> authServerClient.revokeToken(accessToken, LOGOUT_REASON));
		CookieUtils.expireRefreshTokenCookie(servletResponse);
	}

	private void applyTokenToResponse(final HttpServletResponse servletResponse, final TokenIssueResDto tokenDto) {
		servletResponse.setHeader(AUTHORIZATION, BEARER_PREFIX + tokenDto.accessToken());
		CookieUtils.addRefreshTokenCookie(servletResponse, tokenDto.refreshToken());
	}

	private Optional<String> extractBearerToken(final HttpServletRequest servletRequest) {
		String authorizationHeader = servletRequest.getHeader(AUTHORIZATION);
		if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
			return Optional.empty();
		}
		return Optional.of(authorizationHeader.substring(BEARER_PREFIX.length()));
	}
}
