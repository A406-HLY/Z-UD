package com.bank.auth.service.command.impl;

import org.springframework.stereotype.Service;

import com.bank.auth.entity.RefreshToken;
import com.bank.auth.repository.RefreshTokenRepository;
import com.bank.auth.service.command.RefreshTokenCommandService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshTokenCommandServiceImpl implements RefreshTokenCommandService {

	private final RefreshTokenRepository refreshTokenRepository;

	@Override
	public void save(final String employeeNumber, final String tokenValue, final long ttlSeconds) {
		refreshTokenRepository.save(RefreshToken.builder()
			.employeeNumber(employeeNumber)
			.tokenValue(tokenValue)
			.ttlSeconds(ttlSeconds)
			.build());
		log.info("[Token] 리프레시 토큰 저장 완료 - employeeNumber: {}", employeeNumber);
	}

	@Override
	public void deleteByEmployeeNumber(final String employeeNumber) {
		refreshTokenRepository.deleteById(employeeNumber);
		log.info("[Token] 리프레시 토큰 삭제 완료 - employeeNumber: {}", employeeNumber);
	}
}

