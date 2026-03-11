package com.zud.backend.domain.user.exception;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

public class UserException extends BusinessException {

	public UserException(final ErrorCode errorCode) {
		super(errorCode);
	}
}
