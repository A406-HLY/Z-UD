package com.bank.user.exception;

import com.bank.common.error.ErrorCode;
import com.bank.common.error.exception.BusinessException;

public class UserException extends BusinessException {

	public UserException(final ErrorCode errorCode) {
		super(errorCode);
	}
}
