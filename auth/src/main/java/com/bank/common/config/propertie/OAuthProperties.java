package com.bank.common.config.propertie;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auth.oauth")
public record OAuthProperties(
	String clientId,
	String clientSecret,
	Duration accessTokenTtl,
	Duration refreshTokenTtl,
	List<String> allowedOrigins
) {
}