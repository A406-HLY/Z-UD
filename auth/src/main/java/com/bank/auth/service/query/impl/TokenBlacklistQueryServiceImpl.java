package com.bank.auth.service.query.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.auth.repository.TokenBlacklistRepository;
import com.bank.auth.service.query.TokenBlacklistQueryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class TokenBlacklistQueryServiceImpl implements TokenBlacklistQueryService {

	private final TokenBlacklistRepository tokenBlacklistRepository;

	@Override
	public boolean existsByJti(final String jti) {
		return tokenBlacklistRepository.existsById(jti);
	}
}

