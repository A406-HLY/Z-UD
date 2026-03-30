package com.zud.backend.domain.consultation.exception;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

public class ConsultationException extends BusinessException {
	public ConsultationException(final ErrorCode errorCode) {
		super(errorCode);
	}
}
