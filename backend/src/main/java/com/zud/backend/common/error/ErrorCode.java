package com.zud.backend.common.error;

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
	DATA_INTEGRITY_VIOLATION(HttpStatus.CONFLICT, "C-010", "데이터 무결성 위반입니다."),
	SERIALIZE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C-011", "직렬화 중 오류가 발생했습니다."),
	DESERIALIZE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C-012", "역직렬화 중 오류가 발생했습니다."),
	GZIP_COMPRESS_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C-013", "GZIP 압축 중 오류가 발생했습니다."),
	GZIP_DECOMPRESS_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C-014", "GZIP 압축 해제 중 오류가 발생했습니다."),

	/**
	 * User Error (US-xxx)
	 */
	INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "US-001", "사번 또는 비밀번호가 일치하지 않습니다."),
	ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "US-002", "로그인 시도 초과로 계정이 잠겼습니다."),
	USER_NOT_REGISTERED(HttpStatus.FORBIDDEN, "US-003", "등록되지 않은 사용자입니다.");

	private final HttpStatus httpStatus;
	private final String code;
	private final String message;
}
