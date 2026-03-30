package com.zud.backend.domain.consultation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "consultation_transfer_self_employed_details")
public class ConsultationTransferSelfEmployedDetail {

	@Id
	private String consultationId;

	@MapsId
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "consultation_id", nullable = false, updatable = false)
	private ConsultationTransfer transfer;

	@Column(name = "business_name", length = 100)
	private String businessName;

	@Column(name = "business_registration_number", length = 30)
	private String businessRegistrationNumber;

	@Column(name = "income_year", length = 10)
	private String incomeYear;

	@Column(name = "income_amount")
	private Long incomeAmount;

	@Column(name = "taxable_sales_amount")
	private Long taxableSalesAmount;
}

