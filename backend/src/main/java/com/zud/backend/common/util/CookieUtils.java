package com.zud.backend.common.util;

import java.util.Arrays;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CookieUtils {

	private static final String PATH = "/";
	private static final String SAME_SITE_OPTION = "None";
	private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

	public ResponseCookie generateRefreshTokenCookie(final String refreshToken) {
		return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
			.httpOnly(true)
			.secure(true)
			.sameSite(SAME_SITE_OPTION)
			.path(PATH)
			.build();
	}

	public void addRefreshTokenCookie(final HttpServletResponse response, final String refreshToken) {
		response.addHeader(HttpHeaders.SET_COOKIE, generateRefreshTokenCookie(refreshToken).toString());
	}

	public void expireRefreshTokenCookie(final HttpServletResponse response) {
		ResponseCookie expiredCookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
			.httpOnly(true)
			.secure(true)
			.sameSite(SAME_SITE_OPTION)
			.path(PATH)
			.maxAge(0)
			.build();
		response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie.toString());
	}

	public Optional<String> extractRefreshToken(final HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return Optional.empty();
		}
		return Arrays.stream(cookies)
			.filter(cookie -> REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName()))
			.findFirst()
			.map(Cookie::getValue);
	}
}