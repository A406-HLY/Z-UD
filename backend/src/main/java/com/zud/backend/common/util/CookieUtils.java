package com.zud.backend.common.util;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.auth.enums.SessionConstants;
import com.zud.backend.domain.auth.exception.AuthException;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CookieUtils {

	private static final String PATH = "/";

	public Cookie generateSessionCookie(final String sessionId) {
		Cookie cookie = new Cookie(SessionConstants.PREFIX, sessionId);
		cookie.setPath(PATH);
		ZonedDateTime seoulTime = ZonedDateTime.now(ZoneId.of("Asia/Seoul"));
		ZonedDateTime expirationTime = seoulTime.plusHours(SessionConstants.EXPIRATION_HOUR_TIME);
		cookie.setMaxAge((int)(expirationTime.toEpochSecond() - seoulTime.toEpochSecond()));
		cookie.setSecure(true);
		cookie.setHttpOnly(true);
		return cookie;
	}

	public Cookie deleteSessionCookie(final String sessionId) {
		Cookie cookie = new Cookie(SessionConstants.PREFIX, sessionId);
		cookie.setPath(PATH);
		cookie.setMaxAge(0);
		cookie.setSecure(true);
		cookie.setHttpOnly(true);
		return cookie;
	}

	public static String extractSessionId(final HttpServletRequest request) {
		return Arrays.stream(request.getCookies())
			.filter(cookie -> SessionConstants.PREFIX.equals(cookie.getName()))
			.findFirst()
			.orElseThrow(() -> new AuthException(ErrorCode.SESSION_NOT_FOUND))
			.getValue();
	}
}