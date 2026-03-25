package com.zud.backend.common.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.zud.backend.common.config.properties.AuthProperties;
import com.zud.backend.common.filter.JwtAuthFilter;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(AuthProperties.class)
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class SecurityConfig {

	private static final String[] WHITELIST = {
		"/swagger-ui/**",
		"/v3/api-docs/**",
		"/api/v1/auth/login",
		"/error",
		"/grafana",
		"/grafana/**",
		"/api/v1/documents",
		"/api/v1/documents/**",
		"/actuator/health",
		"/actuator/health/**",
		"/actuator/prometheus"
	};

	private final JwtAuthFilter jwtAuthFilter;
	private final CorsConfigurationSource corsConfigurationSource;
	private final AuthProperties authProperties;

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public JwtDecoder jwtDecoder() {
		return NimbusJwtDecoder.withJwkSetUri(authProperties.jwksUri()).build();
	}

	@Bean
	public SecurityFilterChain filterChain(final HttpSecurity http) {
		http
			.cors(cors -> cors.configurationSource(corsConfigurationSource))
			.csrf(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.logout(AbstractHttpConfigurer::disable)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		http
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers(EndpointRequest.toAnyEndpoint()).permitAll()
				.requestMatchers(WHITELIST).permitAll()
				.anyRequest().authenticated())
			.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
