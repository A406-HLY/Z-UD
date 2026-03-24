package com.bank.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

import com.bank.common.oauth.OAuthClientService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity(debug = true)
@RequiredArgsConstructor
public class SecurityConfig {

	@Lazy
	private final OAuthClientService oAuthClientService;

	@Bean
	@Order(1)
	public SecurityFilterChain serverFilterChain(HttpSecurity http) {
		OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = new OAuth2AuthorizationServerConfigurer();

		http
			.securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
			.with(authorizationServerConfigurer,
				authorizationServer -> authorizationServer.oidc(Customizer.withDefaults()))
			.csrf(AbstractHttpConfigurer::disable)
			.cors(Customizer.withDefaults())
			.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
			.exceptionHandling(exceptions -> exceptions
				.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
			)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()));

		return http.build();
	}

	@Bean
	@Order(2)
	public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) {
		http
			.csrf(AbstractHttpConfigurer::disable)
			.cors(Customizer.withDefaults())
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
				.requestMatchers("/actuator/**").permitAll()
				.requestMatchers("/api/v1/token/**").permitAll()
				.anyRequest().authenticated()
			)
			.exceptionHandling(exceptions -> exceptions
				.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
			)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()));

		return http.build();
	}

	@Bean
	public RegisteredClientRepository registeredClientRepository() {
		return new RegisteredClientRepository() {
			@Override
			public void save(RegisteredClient registeredClient) {
			}

			@Override
			public RegisteredClient findById(String id) {
				return oAuthClientService.findByIdString(id);
			}

			@Override
			public RegisteredClient findByClientId(String clientId) {
				return oAuthClientService.loadClientByClientId(clientId);
			}
		};
	}

	@Bean
	public AuthorizationServerSettings authorizationServerSettings() {
		return AuthorizationServerSettings.builder()
			.build();
	}

}

