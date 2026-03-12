package com.zud.backend.domain.branch.exception;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

public class BranchException extends BusinessException {
	public BranchException(final ErrorCode errorCode) {
		super(errorCode);
	}
}
