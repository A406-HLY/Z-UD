package com.zud.backend.domain.branch.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties
public record KakaoApiProperties(
	String key,
	String baseUrl
) {
}
