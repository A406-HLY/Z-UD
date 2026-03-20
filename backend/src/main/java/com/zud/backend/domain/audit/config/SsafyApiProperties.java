package com.zud.backend.domain.audit.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("ssafy.api")
public record SsafyApiProperties(
	String baseUrl,
	String apiKey,
	String datePattern,
	String timePattern,
	String institutionCode,
	String fintechAppNo,
	String memberPath,
	String inquireCreditRatingPath,
	String inquireLoanAccountListPath,
	String inquireRepaymentRecordsPath
) {
}
