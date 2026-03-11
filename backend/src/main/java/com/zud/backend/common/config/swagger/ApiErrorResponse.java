package com.zud.backend.common.config.swagger;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@ApiResponse400
@ApiResponse401
@ApiResponse403
@ApiResponse500
public @interface ApiErrorResponse {
}
