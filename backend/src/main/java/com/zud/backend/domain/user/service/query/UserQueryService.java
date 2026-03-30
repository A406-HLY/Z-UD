package com.zud.backend.domain.user.service.query;

import com.zud.backend.domain.user.entity.User;

public interface UserQueryService {
	User findByEmployeeNumber(final String employeeNumber);

	User findById(final Long userId);
}
