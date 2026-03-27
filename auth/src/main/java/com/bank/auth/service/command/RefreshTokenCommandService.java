package com.bank.auth.service.command;

public interface RefreshTokenCommandService {

	void save(final String employeeNumber, final String tokenValue, final long ttlSeconds);

	void deleteByEmployeeNumber(final String employeeNumber);
}

