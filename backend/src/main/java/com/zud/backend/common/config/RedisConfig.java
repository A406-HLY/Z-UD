package com.zud.backend.common.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zud.backend.common.config.properties.RedisProperties;
import com.zud.backend.common.serializer.GzipRedisSerializer;
import com.zud.backend.domain.auth.session.UserSession;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableRedisRepositories
@EnableConfigurationProperties(RedisProperties.class)
@RequiredArgsConstructor
public class RedisConfig {

	private final RedisProperties redisProperties;
	private final ObjectMapper objectMapper;

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
	public RedisTemplate<String, UserSession> sessionRedisTemplate() {
		return createGzipJsonRedisTemplate(objectMapper, new TypeReference<>() {
		});
	}

	private <V> RedisTemplate<String, V> createGzipJsonRedisTemplate(
		ObjectMapper objectMapper,
		TypeReference<V> typeRef
	) {
		RedisTemplate<String, V> redisTemplate = new RedisTemplate<>();
		redisTemplate.setConnectionFactory(redisConnectionFactory());
		redisTemplate.setKeySerializer(new StringRedisSerializer());
		redisTemplate.setValueSerializer(new GzipRedisSerializer<>(objectMapper, typeRef));
		return redisTemplate;
	}
}
