package com.zud.backend.domain.document.exception;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

public class DocumentException extends BusinessException {
	public DocumentException(final ErrorCode errorCode) {
		super(errorCode);
	}
}
