package com.zud.backend.domain.auth.exception;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

public class AuthException extends BusinessException {

	public AuthException(final ErrorCode errorCode) {
		super(errorCode);
	}
}
