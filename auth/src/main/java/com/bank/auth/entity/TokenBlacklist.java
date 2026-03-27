package com.bank.auth.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@RedisHash("token_blacklist")
public class TokenBlacklist {

	@Id
	private String jti;

	private String employeeNumber;

	private String reason;

	@TimeToLive
	private Long ttlSeconds;
}
