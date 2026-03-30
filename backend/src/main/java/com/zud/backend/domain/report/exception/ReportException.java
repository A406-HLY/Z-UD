package com.zud.backend.domain.report.exception;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

public class ReportException extends BusinessException {
	public ReportException(ErrorCode errorCode) {
		super(errorCode);
	}
}
