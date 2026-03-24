package com.bank.common.error;

import org.springframework.http.HttpStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public enum ErrorCode {

	/**
	 * Common Error (CO-xxx)
	 */
	BAD_REQUEST(HttpStatus.BAD_REQUEST, "C-001", "잘못된 요청입니다."),
	NOT_FOUND(HttpStatus.NOT_FOUND, "C-002", "리소스를 찾을 수 없습니다."),
	INVALID_INPUT(HttpStatus.BAD_REQUEST, "C-003", "유효하지 않은 입력값입니다."),
	INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C-004", "서버 오류가 발생했습니다."),
	JSON_PARSING_ERROR(HttpStatus.BAD_REQUEST, "C-005", "JSON 파싱 중 오류가 발생했습니다."),
	TEMPLATE_LOADING_FAILED(HttpStatus.NOT_FOUND, "C-006", "템플릿 로딩에 실패했습니다."),
	ACCESS_DENIED(HttpStatus.FORBIDDEN, "C-007", "요청한 리소스에 접근할 수 없습니다."),
	METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C-008", "지원하지 않는 HTTP 메서드입니다."),
	UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "C-009", "지원하지 않는 미디어 타입입니다."),
	DATA_INTEGRITY_VIOLATION(HttpStatus.CONFLICT, "C-010", "데이터 무결성 위반이 발생했습니다."),
	/**
	 * AUTH Error (AU-xxx)
	 */
	SESSION_NOT_FOUND(HttpStatus.UNAUTHORIZED, "AU-001", "세션을 찾을 수 없습니다."),

	/**
	 * User Error (US-xxx)
	 */
	INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "US-001", "사번 또는 비밀번호가 일치하지 않습니다."),
	ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "US-002", "로그인 시도 초과로 계정이 잠겼습니다."),
	USER_NOT_REGISTERED(HttpStatus.FORBIDDEN, "US-003", "등록되지 않은 사용자입니다."),
	USER_NOT_FOUND(HttpStatus.NOT_FOUND, "US-004", "사용자를 찾을 수 없습니다."),

	/**
	 * Token Error (TK-xxx)
	 */
	TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "TK-001", "토큰이 만료되었습니다."),
	TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "TK-002", "유효하지 않은 토큰입니다."),
	TOKEN_BLACKLISTED(HttpStatus.UNAUTHORIZED, "TK-003", "무효화된 토큰입니다."),
	REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "TK-004", "리프레시 토큰을 찾을 수 없습니다."),

	/**
	 * Encryption Error (EN-xxx)
	 */
	ENCRYPTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "EN-001", "주민등록번호 암호화 처리에 실패했습니다."),
	DECRYPTION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "EN-002", "주민등록번호 복호화 처리에 실패했습니다."),
	ENCRYPTED_DATA_INVALID(HttpStatus.INTERNAL_SERVER_ERROR, "EN-003", "암호화된 데이터 형식이 올바르지 않습니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
