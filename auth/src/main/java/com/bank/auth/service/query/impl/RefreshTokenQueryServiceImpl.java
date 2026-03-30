package com.bank.auth.service.query.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.auth.entity.RefreshToken;
import com.bank.auth.repository.RefreshTokenRepository;
import com.bank.auth.service.query.RefreshTokenQueryService;
import com.bank.common.error.ErrorCode;
import com.bank.common.error.exception.BusinessException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshTokenQueryServiceImpl implements RefreshTokenQueryService {

	private final RefreshTokenRepository refreshTokenRepository;

	@Override
	public String findTokenValueByEmployeeNumber(final String employeeNumber) {
		String tokenValue = refreshTokenRepository.findById(employeeNumber)
			.map(RefreshToken::getTokenValue)
			.orElseThrow(() -> new BusinessException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
		log.info("[Token] 리프레시 토큰 조회 성공 - employeeNumber: {}", employeeNumber);
		return tokenValue;
	}
}

