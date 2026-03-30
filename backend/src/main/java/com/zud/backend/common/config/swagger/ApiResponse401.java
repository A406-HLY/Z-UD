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
	responseCode = "401",
	description = "인증 실패",
	content = @Content(
		mediaType = "application/json",
		examples = @ExampleObject(value = ErrorResponseExample.INVALID_CREDENTIALS)
	)
)
public @interface ApiResponse401 {
}

