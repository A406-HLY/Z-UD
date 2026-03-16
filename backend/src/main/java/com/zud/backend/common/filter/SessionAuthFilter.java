package com.zud.backend.common.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.zud.backend.common.util.CookieUtils;
import com.zud.backend.domain.auth.enums.SessionConstants;
import com.zud.backend.domain.auth.session.UserSession;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionAuthFilter extends OncePerRequestFilter {

	private static final String[] EXCLUDE_PATHS = {
		"/api/v1/auth/login",
		"/swagger-ui/**",
		"/v3/api-docs/**",
	};

	private final RedisTemplate<String, UserSession> sessionRedisTemplate;

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		shouldNotFilter(request);
		String sessionId = CookieUtils.extractSessionId(request);
		if (sessionId != null) {
			String sessionKey = SessionConstants.PREFIX + sessionId;
			UserSession session = sessionRedisTemplate.opsForValue().get(sessionKey);
			if (session != null) {
				UsernamePasswordAuthenticationToken auth =
					new UsernamePasswordAuthenticationToken(
						session.getUserId(), null, Collections.emptyList()
					);
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
		}
		filterChain.doFilter(request, response);
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getRequestURI();
		return Arrays.stream(EXCLUDE_PATHS)
			.anyMatch(ep -> ep.endsWith("/**")
				? path.startsWith(ep.replace("/**", ""))
				: path.equals(ep));
	}
}
