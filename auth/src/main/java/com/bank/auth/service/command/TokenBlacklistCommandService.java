package com.bank.auth.service.command;

public interface TokenBlacklistCommandService {

	void save(final String jti, final String employeeNumber, final String reason, final long ttlSeconds);
}

