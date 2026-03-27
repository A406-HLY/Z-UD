package com.bank.auth.service.query;

public interface TokenBlacklistQueryService {

	boolean existsByJti(final String jti);
}

