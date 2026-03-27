package com.bank.auth.service.command.impl;

import org.springframework.stereotype.Service;

import com.bank.auth.entity.TokenBlacklist;
import com.bank.auth.repository.TokenBlacklistRepository;
import com.bank.auth.service.command.TokenBlacklistCommandService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class TokenBlacklistCommandServiceImpl implements TokenBlacklistCommandService {

	private final TokenBlacklistRepository tokenBlacklistRepository;

	@Override
	public void save(final String jti, final String employeeNumber, final String reason, final long ttlSeconds) {
		tokenBlacklistRepository.save(TokenBlacklist.builder()
			.jti(jti)
			.employeeNumber(employeeNumber)
			.reason(reason)
			.ttlSeconds(ttlSeconds)
			.build());
		log.info("[Token] 블랙리스트 등록 완료 - jti: {}, employeeNumber: {}", jti, employeeNumber);
	}
}

