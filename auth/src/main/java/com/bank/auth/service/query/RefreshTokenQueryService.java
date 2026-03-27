package com.bank.auth.service.query;

public interface RefreshTokenQueryService {

	String findTokenValueByEmployeeNumber(final String employeeNumber);
}

