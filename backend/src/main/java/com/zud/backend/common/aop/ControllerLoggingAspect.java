package com.zud.backend.common.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import com.zud.backend.common.util.LoggingUtils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Aspect
@Component
public class ControllerLoggingAspect {

	@Around("execution( * com.zud.backend..controller..*(..) )")
	public Object logControllerExecution(ProceedingJoinPoint joinPoint) throws Throwable {
		long start = System.currentTimeMillis();

		MethodSignature signature = (MethodSignature)joinPoint.getSignature();
		String className = signature.getDeclaringType().getSimpleName();
		String methodName = signature.getName();

		log.info("[Controller Request] {}.{}", className, methodName);

		try {
			Object result = joinPoint.proceed();
			long end = System.currentTimeMillis();
			long executionTime = end - start;

			log.info("[Controller Response] {}.{} time = {}ms", className, methodName, executionTime);

			return result;
		} catch (Exception e) {
			long end = System.currentTimeMillis();
			long executionTime = end - start;
			String maskedMessage = LoggingUtils.maskSensitive(e.getMessage());

			log.error("[Controller Exception] {}.{} time = {}ms, message = {}",
				className, methodName, executionTime, maskedMessage, e);

			throw e;
		}
	}

}