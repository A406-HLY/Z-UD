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
	 * Branch Error (BR-xxx)
	 */
	ADDRESS_COORDINATE_NOT_FOUND(HttpStatus.NOT_FOUND, "BR-001", "주소에 대한 좌표를 찾을 수 없습니다."),
	BRANCH_NOT_FOUND(HttpStatus.NOT_FOUND, "BR-002", "지점을 찾을 수 없습니다."),

	/**
	 * File Error (F-xxx)
	 */
	FILE_EMPTY(HttpStatus.BAD_REQUEST, "F-001", "업로드할 파일이 비어있습니다."),
	FILE_NAME_INVALID(HttpStatus.BAD_REQUEST, "F-002", "파일명이 유효하지 않습니다."),
	FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "F-003", "파일 업로드에 실패했습니다."),
	FILE_TYPE_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "F-004", "허용되지 않는 파일 형식입니다."),
	FILE_EXTENSION_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "F-005", "허용되지 않는 파일 확장자입니다."),
	FILE_MIME_TYPE_MISMATCH(HttpStatus.BAD_REQUEST, "F-006", "MIME 타입이 파일 확장자와 일치하지 않습니다."),
	FILE_SIGNATURE_MISMATCH(HttpStatus.BAD_REQUEST, "F-007", "파일 시그니처가 일치하지 않습니다."),
	FILE_SIZE_EXCEEDED(HttpStatus.BAD_REQUEST, "F-008", "파일 크기가 제한을 초과했습니다."),
	FILE_NAME_TOO_LONG(HttpStatus.BAD_REQUEST, "F-009", "파일명이 너무 깁니다."),

	/**
	 * House Price Error (HP-xxx)
	 */
	INVALID_HOUSE_TYPE(HttpStatus.BAD_REQUEST, "HP-001", "주택담보대출이 불가능한 주택 유형입니다."),
	HOUSE_PRICE_NOT_FOUND(HttpStatus.NOT_FOUND, "HP-002", "주택 시세 조회가 불가합니다. 수기로 입력해주세요."),
	INVALID_ADDRESS_FORMAT(HttpStatus.BAD_REQUEST, "HP-003", "주소 형식이 올바르지 않습니다."),
	ILLEGAL_BUILDING(HttpStatus.BAD_REQUEST, "HP-004", "위반건축물은 주택담보대출 대상 건물이 될 수 없습니다."),

	/**
	 * Consultation Error (CO-xxx)
	 */
	CONSULTATION_NOT_FOUND(HttpStatus.NOT_FOUND, "CO-001", "상담 정보를 찾을 수 없습니다."),

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
