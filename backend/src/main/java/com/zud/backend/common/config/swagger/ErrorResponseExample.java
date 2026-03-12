package com.zud.backend.common.config.swagger;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ErrorResponseExample {

	public static final String VALIDATION_FAILED = """
		{
			"success": false,
			"data": null,
			"error": {
				"status": "BAD_REQUEST",
				"message": "유효하지 않은 입력값입니다.",
				"method": "POST",
				"requestUri": "/api/v1/example",
				"errors": [
					{ "field": "employeeNumber", "message": "사원 번호는 필수 입력값 입니다." }
				]
			},
			"timestamp": "2026-03-11 12:00:00"
		}""";

	public static final String INVALID_CREDENTIALS = """
		{
			"success": false,
			"data": null,
			"error": {
				"status": "UNAUTHORIZED",
				"message": "사번 또는 비밀번호가 일치하지 않습니다.",
				"method": "POST",
				"requestUri": "/api/v1/auth/login",
				"errors": []
			},
			"timestamp": "2026-03-11 12:00:00"
		}""";

	public static final String ACCESS_DENIED = """
		{
			"success": false,
			"data": null,
			"error": {
				"status": "FORBIDDEN",
				"message": "요청한 리소스에 접근할 수 없습니다.",
				"method": "GET",
				"requestUri": "/api/v1/example",
				"errors": []
			},
			"timestamp": "2026-03-11 12:00:00"
		}""";

	public static final String ACCOUNT_LOCKED = """
		{
			"success": false,
			"data": null,
			"error": {
				"status": "FORBIDDEN",
				"message": "로그인 시도 초과로 계정이 잠겼습니다.",
				"method": "POST",
				"requestUri": "/api/v1/auth/login",
				"errors": []
			},
			"timestamp": "2026-03-11 12:00:00"
		}""";

	public static final String USER_NOT_FOUND = """
		{
			"success": false,
			"data": null,
			"error": {
				"status": "NOT_FOUND",
				"message": "사용자를 찾을 수 없습니다.",
				"method": "GET",
				"requestUri": "/api/v1/users/999",
				"errors": []
			},
			"timestamp": "2026-03-11 12:00:00"
		}""";

	public static final String RESOURCE_NOT_FOUND = """
		{
			"success": false,
			"data": null,
			"error": {
				"status": "NOT_FOUND",
				"message": "리소스를 찾을 수 없습니다.",
				"method": "GET",
				"requestUri": "/api/v1/example/999",
				"errors": []
			},
			"timestamp": "2026-03-11 12:00:00"
		}""";

	public static final String INTERNAL_SERVER_ERROR = """
		{
			"success": false,
			"data": null,
			"error": {
				"status": "INTERNAL_SERVER_ERROR",
				"message": "서버 오류가 발생했습니다.",
				"method": "POST",
				"requestUri": "/api/v1/example",
				"errors": []
			},
			"timestamp": "2026-03-11 12:00:00"
		}""";
	// @checkstyle:on
}

