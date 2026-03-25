package com.zud.backend.common.filter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

	private static final String AUTHORIZATION_HEADER = "Authorization";
	private static final String BEARER_PREFIX = "Bearer ";

	private final JwtDecoder jwtDecoder;

	@Override
	protected void doFilterInternal(
		final @NonNull HttpServletRequest request,
		final @NonNull HttpServletResponse response,
		final FilterChain filterChain
	) throws ServletException, IOException {
		extractToken(request).ifPresent(token -> {
			try {
				Jwt jwt = jwtDecoder.decode(token);
				Long userId = jwt.getClaim("userId");
				UsernamePasswordAuthenticationToken auth =
					new UsernamePasswordAuthenticationToken(userId, jwt, Collections.emptyList());
				SecurityContextHolder.getContext().setAuthentication(auth);
			} catch (JwtException e) {
				log.warn("[JwtAuthFilter] 유효하지 않은 토큰: {}", e.getMessage());
			}
		});
		filterChain.doFilter(request, response);
	}

	private Optional<String> extractToken(final HttpServletRequest request) {
		String header = request.getHeader(AUTHORIZATION_HEADER);
		if (header != null && header.startsWith(BEARER_PREFIX)) {
			return Optional.of(header.substring(BEARER_PREFIX.length()));
		}
		return Optional.empty();
	}
}
