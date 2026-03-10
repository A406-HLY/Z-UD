package com.backend.zud.common.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Aspect
@Component
public class ServiceLoggingAspect {

	private static final long SLOW_THRESHOLD_MS = 1000L;

	@Around("execution( * com.backend..service..*(..) )")
	public Object logServiceExecution(ProceedingJoinPoint joinPoint) throws Throwable {
		long start = System.currentTimeMillis();

		MethodSignature signature = (MethodSignature)joinPoint.getSignature();
		String className = signature.getDeclaringType().getSimpleName();
		String methodName = signature.getName();

		log.debug("[Service Start] {}.{}", className, methodName);

		Object result = joinPoint.proceed();

		long end = System.currentTimeMillis();
		long executionTime = end - start;

		log.debug("[Service End] {}.{} time = {}ms", className, methodName, executionTime);

		// 느린 서비스 WARN
		if (executionTime >= SLOW_THRESHOLD_MS) {
			log.warn("[Slow Service] {}.{} executed in {}ms", className, methodName, executionTime);
		}

		return result;
	}
}