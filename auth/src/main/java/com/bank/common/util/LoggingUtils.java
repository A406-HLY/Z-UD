package com.bank.common.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import jakarta.servlet.http.HttpServletRequest;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@UtilityClass
public class LoggingUtils {
	private static final Pattern RESIDENT_REGISTRATION_PATTERN = Pattern.compile("(\\d{6})-(\\d)\\d{6}");

	/**
	 * 일반 예외를 로깅합니다. Logback의 exception/stacktrace 필드를 활용합니다.
	 *
	 * @param prefix  로그 메시지 앞에 붙일 식별자
	 * @param ex      발생한 예외
	 * @param request 요청 정보
	 */
	public void logException(final String prefix, final Exception ex, final HttpServletRequest request) {
		String maskedMessage = maskSensitive(ex.getMessage());

		log.error("{}: {} | 예외 발생 지점 [{} {}]", prefix, maskedMessage, request.getMethod(), request.getRequestURI(), ex);
	}

	/**
	 * 유효성 검사 예외를 로깅합니다. 실패한 필드와 메시지를 출력합니다.
	 *
	 * @param ex      MethodArgumentNotValidException
	 * @param request 요청 정보
	 */
	public void logValidationException(final MethodArgumentNotValidException ex, final HttpServletRequest request) {
		String errorFields = ex.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(LoggingUtils::formatFieldError)
			.collect(Collectors.joining(", "));

		log.error("유효성 검사 실패 | 예외 발생 지점 [{} {}] | 실패 필드: {}", request.getMethod(), request.getRequestURI(), errorFields,
			ex);
	}

	private String formatFieldError(final FieldError error) {
		return String.format("[field: %s, message: %s]", error.getField(), error.getDefaultMessage());
	}

	public String maskSensitive(final String raw) {
		if (raw == null || raw.isBlank()) {
			return raw;
		}

		Matcher matcher = RESIDENT_REGISTRATION_PATTERN.matcher(raw);
		StringBuilder masked = new StringBuilder();

		while (matcher.find()) {
			matcher.appendReplacement(masked, matcher.group(1) + "-" + matcher.group(2) + "******");
		}

		matcher.appendTail(masked);
		return masked.toString();
	}
}
