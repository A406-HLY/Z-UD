package com.zud.backend.common.config;

import java.net.URI;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.zud.backend.common.config.properties.CloudflareProperties;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@EnableConfigurationProperties(CloudflareProperties.class)
@RequiredArgsConstructor
public class CloudflareConfig {

	private final CloudflareProperties cloudflareProperties;

	@Bean
	public S3Client s3Client() {
		return S3Client.builder()
			.endpointOverride(URI.create(cloudflareProperties.endpoint()))
			.credentialsProvider(credentialsProvider())
			.region(Region.of("auto"))
			.serviceConfiguration(S3Configuration.builder()
				.chunkedEncodingEnabled(false)
				.build())
			.build();
	}

	@Bean
	public S3Presigner s3Presigner() {
		return S3Presigner.builder()
			.endpointOverride(URI.create(cloudflareProperties.endpoint()))
			.credentialsProvider(credentialsProvider())
			.region(Region.of("auto"))
			.serviceConfiguration(S3Configuration.builder()
				.chunkedEncodingEnabled(false)
				.build())
			.build();
	}

	private StaticCredentialsProvider credentialsProvider() {
		final AwsBasicCredentials credentials = AwsBasicCredentials.create(
			cloudflareProperties.accessKey(),
			cloudflareProperties.secretKey()
		);
		return StaticCredentialsProvider.create(credentials);
	}
}