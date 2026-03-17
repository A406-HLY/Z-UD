package com.zud.backend.domain.houseprice.exception;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;

public class HousePriceException extends BusinessException {
	public HousePriceException(final ErrorCode errorCode) {
		super(errorCode);
	}
}
