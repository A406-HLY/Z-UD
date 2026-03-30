package com.bank.auth.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public enum TokenAction {
	TOKEN_ISSUE("토큰 발급"),
	TOKEN_REFRESH("토큰 재발급"),
	TOKEN_REVOKE("토큰 만료처리");
	private final String description;
}
