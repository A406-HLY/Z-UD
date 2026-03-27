package com.bank.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.auth.entity.AuditLog;
import com.bank.auth.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AuditLogService {

	private final AuditLogRepository auditLogRepository;

	public void save(final AuditLog auditLog) {
		auditLogRepository.save(auditLog);
		log.info("[AuditLog] action: {}, employeeNumber: {}, success: {}", auditLog.getAction(),
			auditLog.getEmployeeNumber(), auditLog.getSuccess());
	}
}
