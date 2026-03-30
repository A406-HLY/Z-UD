package com.bank.auth.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public enum TokenType {
	ACCESS("access"),
	REFRESH("refresh");
	private final String value;
}
