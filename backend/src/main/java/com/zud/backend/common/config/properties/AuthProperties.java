package com.zud.backend.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auth")
public record AuthProperties(
	String serverUrl,
	String clientId,
	String clientSecret,
	String jwksUri,
	String issuePath,
	String reissuePath,
	String revokePath,
	String blacklistPath
) {
}
