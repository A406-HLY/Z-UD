package com.zud.backend.common.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.zud.backend.common.constant.BackDomain;
import com.zud.backend.common.constant.FrontDomain;

@Configuration
public class CorsConfig {
	private static final List<String> ALLOWED_ORIGINS = List.of(
		BackDomain.LOCAL.getUrl(),
		BackDomain.PROD.getUrl(),
		FrontDomain.LOCAL.getUrl(),
		FrontDomain.AGENT.getUrl()
	);

	private static final List<String> ALLOWED_HEADERS = List.of(
		"Authorization",
		"Content-Type",
		"Accept",
		"Origin",
		"Access-Control-Request-Method",
		"Access-Control-Request-Headers",
		"X-Requested-With",
		"Cookie"
	);

	private static final List<String> ALLOWED_METHODS = List.of(
		"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
	);

	private static final List<String> EXPOSED_HEADERS = List.of(
		"Set-Cookie"
	);

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowCredentials(true);
		config.setAllowedOrigins(ALLOWED_ORIGINS);
		config.setAllowedHeaders(ALLOWED_HEADERS);
		config.setAllowedMethods(ALLOWED_METHODS);
		config.setExposedHeaders(EXPOSED_HEADERS);
		config.setMaxAge(3600L);

		source.registerCorsConfiguration("/**", config);
		return source;
	}
}