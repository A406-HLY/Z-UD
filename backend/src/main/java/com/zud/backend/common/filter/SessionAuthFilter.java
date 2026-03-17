package com.zud.backend.common.filter;

import java.io.IOException;
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

	private final RedisTemplate<String, UserSession> sessionRedisTemplate;

	@Override
	protected void doFilterInternal(
		HttpServletRequest request,
		HttpServletResponse response,
		FilterChain filterChain
	) throws ServletException, IOException {
		CookieUtils.extractSessionId(request).ifPresent(sessionId -> {
			String sessionKey = SessionConstants.PREFIX + sessionId;
			UserSession session = sessionRedisTemplate.opsForValue().get(sessionKey);
			if (session != null) {
				UsernamePasswordAuthenticationToken auth =
					new UsernamePasswordAuthenticationToken(
						session.getUserId(), null, Collections.emptyList()
					);
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
		});
		filterChain.doFilter(request, response);
	}
}
