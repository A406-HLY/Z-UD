package com.bank.common.oauth;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.stereotype.Service;

import com.bank.common.config.propertie.OAuthProperties;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@EnableConfigurationProperties(OAuthProperties.class)
public class OAuthClientService {

	private final PasswordEncoder passwordEncoder;
	private final OAuthProperties oAuthProperties;
	private final Map<String, RegisteredClient> clientsById = new ConcurrentHashMap<>();
	private final Map<String, RegisteredClient> clientsByClientId = new ConcurrentHashMap<>();

	@PostConstruct
	void init() {
		RegisteredClient defaultClient = RegisteredClient.withId(UUID.randomUUID().toString())
			.clientId(oAuthProperties.clientId())
			.clientSecret(passwordEncoder.encode(oAuthProperties.clientSecret()))
			.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
			.authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
			.authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
			.scope("openid")
			.scope("profile")
			.tokenSettings(TokenSettings.builder()
				.accessTokenTimeToLive(oAuthProperties.accessTokenTtl())
				.refreshTokenTimeToLive(oAuthProperties.refreshTokenTtl())
				.build())
			.clientSettings(ClientSettings.builder()
				.requireAuthorizationConsent(false)
				.requireProofKey(false)
				.build())
			.build();

		clientsById.put(defaultClient.getId(), defaultClient);
		clientsByClientId.put(defaultClient.getClientId(), defaultClient);
	}

	public List<String> getOriginUris() {
		return oAuthProperties.allowedOrigins();
	}

	public RegisteredClient findByIdString(String id) {
		return clientsById.get(id);
	}

	public RegisteredClient loadClientByClientId(String clientId) {
		return clientsByClientId.get(clientId);
	}
}

