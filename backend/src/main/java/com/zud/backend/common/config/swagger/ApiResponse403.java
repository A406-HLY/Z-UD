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
	responseCode = "403",
	description = "접근 권한 없음",
	content = @Content(
		mediaType = "application/json",
		examples = @ExampleObject(value = ErrorResponseExample.ACCESS_DENIED)
	)
)
public @interface ApiResponse403 {
}

