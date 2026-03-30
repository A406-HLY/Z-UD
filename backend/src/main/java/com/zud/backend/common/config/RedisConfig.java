package com.zud.backend.common.config;

import java.util.List;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.zud.backend.common.config.properties.RedisProperties;
import com.zud.backend.common.serializer.GzipRedisSerializer;
import com.zud.backend.domain.document.redis.OcrExtractionResultCache;
import com.zud.backend.domain.report.redis.LoanReportResultCache;

import lombok.RequiredArgsConstructor;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@Configuration
@EnableRedisRepositories
@EnableConfigurationProperties(RedisProperties.class)
@RequiredArgsConstructor
public class RedisConfig {

	private static final ObjectMapper REDIS_OBJECT_MAPPER = JsonMapper.builder()
		.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
		.build();

	private final RedisProperties redisProperties;

	@Bean
	public RedisConnectionFactory redisConnectionFactory() {
		RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(
			redisProperties.host(),
			redisProperties.port()
		);
		config.setPassword(redisProperties.password());
		return new LettuceConnectionFactory(config);
	}

	@Bean
	public RedisTemplate<String, List<String>> documentVerificationRedisTemplate() {
		return createGzipJsonRedisTemplate(REDIS_OBJECT_MAPPER, new TypeReference<>() {
		});
	}

	@Bean
	public RedisTemplate<String, LoanReportResultCache> loanReportCacheRedisTemplate() {
		return createGzipJsonRedisTemplate(REDIS_OBJECT_MAPPER, new TypeReference<>() {
		});
	}

	@Bean
	public RedisTemplate<String, OcrExtractionResultCache> ocrResultRedisTemplate() {
		return createGzipJsonRedisTemplate(REDIS_OBJECT_MAPPER, new TypeReference<>() {
		});
	}

	private <V> RedisTemplate<String, V> createGzipJsonRedisTemplate(
		final ObjectMapper objectMapper,
		final TypeReference<V> typeRef
	) {
		RedisTemplate<String, V> redisTemplate = new RedisTemplate<>();
		redisTemplate.setConnectionFactory(redisConnectionFactory());
		redisTemplate.setKeySerializer(new StringRedisSerializer());
		redisTemplate.setValueSerializer(new GzipRedisSerializer<>(objectMapper, typeRef));
		return redisTemplate;
	}
}
