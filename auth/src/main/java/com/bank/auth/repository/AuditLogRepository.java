package com.bank.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bank.auth.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
