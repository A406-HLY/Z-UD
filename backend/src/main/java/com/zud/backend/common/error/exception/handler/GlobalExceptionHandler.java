package com.zud.backend.common.error.exception.handler;

import java.nio.file.AccessDeniedException;
import java.sql.SQLException;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.common.error.exception.BusinessException;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.response.ErrorResponse;
import com.zud.backend.common.util.LoggingUtils;
import com.zud.backend.domain.consultation.exception.ConsultationException;
import com.zud.backend.domain.document.exception.DocumentException;
import com.zud.backend.domain.rule.exception.RuleException;
import com.zud.backend.domain.user.exception.UserException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(Exception.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleException(Exception ex, HttpServletRequest request) {
		LoggingUtils.logException("지정되지 않은 예외 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR, request);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleBusinessException(
		BusinessException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("BusinessException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ex.getErrorCode(), request);
		return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleConstraintViolation(
		ConstraintViolationException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("ConstraintViolationException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT, request);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleMethodArgumentNotValid(
		MethodArgumentNotValidException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logValidationException(ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT, request);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleHttpMessageNotReadable(
		HttpMessageNotReadableException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("HttpMessageNotReadableException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT, request);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleMissingServletRequestParameter(
		MissingServletRequestParameterException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("MissingServletRequestParameterException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT, request);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleMethodArgumentTypeMismatch(
		MethodArgumentTypeMismatchException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("MethodArgumentTypeMismatchException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT, request);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleHttpRequestMethodNotSupported(
		HttpRequestMethodNotSupportedException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("HttpRequestMethodNotSupportedException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.METHOD_NOT_ALLOWED, request);
		return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(HttpMediaTypeNotSupportedException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleHttpMediaTypeNotSupported(
		HttpMediaTypeNotSupportedException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("HttpMediaTypeNotSupportedException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.UNSUPPORTED_MEDIA_TYPE, request);
		return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleDataIntegrityViolation(
		DataIntegrityViolationException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("DataIntegrityViolationException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.DATA_INTEGRITY_VIOLATION, request);
		return ResponseEntity.status(HttpStatus.CONFLICT).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(DataAccessException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleDataAccessException(
		DataAccessException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("DataAccessException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR, request);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleAccessDeniedException(
		AccessDeniedException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("AccessDeniedException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.ACCESS_DENIED, request);
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleNoResourceFoundException(
		NoResourceFoundException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("NoResourceFoundException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.NOT_FOUND, request);
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(SQLException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleNoResourceFoundException(
		SQLException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("SQLException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR, request);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(AuthorizationDeniedException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleAuthorizationDeniedException(
		AuthorizationDeniedException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("AuthorizationDeniedException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ErrorCode.ACCESS_DENIED, request);
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(UserException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleUserException(
		UserException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("UserException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ex.getErrorCode(), request);
		return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(DocumentException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleFileStorageException(
		DocumentException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("DocumentException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ex.getErrorCode(), request);
		return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(ConsultationException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleConsultationException(
		ConsultationException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("ConsultationException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ex.getErrorCode(), request);
		return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(BaseResponse.fail(response));
	}

	@ExceptionHandler(RuleException.class)
	public ResponseEntity<BaseResponse<ErrorResponse>> handleRuleException(
		RuleException ex,
		HttpServletRequest request
	) {
		LoggingUtils.logException("RuleException 발생", ex, request);
		ErrorResponse response = ErrorResponse.of(ex.getErrorCode(), request);
		return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(BaseResponse.fail(response));
	}

}
