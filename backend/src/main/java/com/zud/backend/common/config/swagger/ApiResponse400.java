package com.zud.backend.common.config.swagger;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@ApiResponse(
	responseCode = "400",
	description = "입력값 유효성 검증 실패",
	content = @Content(
		mediaType = "application/json",
		examples = @ExampleObject(value = ErrorResponseExample.VALIDATION_FAILED)
	)
)
public @interface ApiResponse400 {
}

