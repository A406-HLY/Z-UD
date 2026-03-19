package com.zud.backend.domain.audit.exception;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

public class AuditException extends BusinessException {

	public AuditException(final ErrorCode errorCode) {
		super(errorCode);
	}
}


