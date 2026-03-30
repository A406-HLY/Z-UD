package com.bank.auth.entity;

import com.bank.auth.enums.TokenAction;
import com.bank.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "employee_number", nullable = false, length = 50)
	private String employeeNumber;

	@Column(name = "action", nullable = false, length = 30)
	@Enumerated(EnumType.STRING)
	private TokenAction action;

	@Column(name = "client_id", length = 100)
	private String clientId;

	@Column(name = "ip_address", length = 45)
	private String ipAddress;

	@Column(name = "details", columnDefinition = "TEXT")
	private String details;

	@Column(name = "success", nullable = false)
	private Boolean success = Boolean.FALSE;

	public static AuditLog create(
		final String employeeNumber,
		final TokenAction action,
		final String clientId,
		final String ipAddress,
		final String details,
		final boolean success
	) {
		return AuditLog.builder()
			.employeeNumber(employeeNumber)
			.action(action)
			.clientId(clientId)
			.ipAddress(ipAddress)
			.details(details)
			.success(success)
			.build();
	}

}
