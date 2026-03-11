package com.zud.backend.domain.auth.service.facade;

import java.util.concurrent.TimeUnit;

import org.apache.catalina.util.StandardSessionIdGenerator;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.util.CookieUtils;
import com.zud.backend.domain.auth.converter.AuthConverter;
import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.response.LoginSuccessResDto;
import com.zud.backend.domain.auth.enums.SessionConstants;
import com.zud.backend.domain.auth.exception.AuthException;
import com.zud.backend.domain.auth.session.UserSession;
import com.zud.backend.domain.user.entity.User;
import com.zud.backend.domain.user.service.query.UserQueryService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthFacadeServiceImpl implements AuthFacadeService {

	private final RedisTemplate<String, UserSession> sessionRedisTemplate;
	private final PasswordEncoder passwordEncoder;

	private final UserQueryService userQueryService;

	@Override
	public LoginSuccessResDto login(final LoginReqDto reqDto, final HttpServletResponse response) {
		User user = userQueryService.findByEmployeeNumber(reqDto.employeeNumber());
		validatePassword(reqDto.password(), user.getPassword());
		String sessionId = generateSessionId(user.getId());
		addSessionCookieToResponse(response, sessionId);
		return AuthConverter.toLoginSuccessDto(user);
	}

	private void validatePassword(final String rawPassword, final String encodedPassword) {
		if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
			throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
		}
	}

	private void addSessionCookieToResponse(final HttpServletResponse response, final String sessionId) {
		Cookie cookie = CookieUtils.generateSessionCookie(sessionId);
		response.addCookie(cookie);
	}

	private String generateSessionId(final Long userId) {
		String sessionId = new StandardSessionIdGenerator().generateSessionId();
		String sessionKey = SessionConstants.PREFIX + sessionId;
		saveSession(userId, sessionKey);
		return sessionId;
	}

	private void saveSession(final Long userId, final String sessionKey) {
		sessionRedisTemplate.opsForValue()
			.set(sessionKey, UserSession.create(userId), SessionConstants.EXPIRATION_HOUR_TIME, TimeUnit.HOURS);
	}
}
