package com.bank.user.service.query;

import com.bank.user.entity.User;

public interface UserQueryService {
	User findByEmployeeNumber(final String employeeNumber);

	User findById(final Long userId);
}
