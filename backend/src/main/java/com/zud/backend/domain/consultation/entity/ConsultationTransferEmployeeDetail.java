package com.zud.backend.domain.consultation.entity;

import java.time.LocalDate;

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
@Table(name = "consultation_transfer_employee_details")
public class ConsultationTransferEmployeeDetail {

	@Id
	private String consultationId;

	@MapsId
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "consultation_id", nullable = false, updatable = false)
	private ConsultationTransfer transfer;

	@Column(name = "has_representative_name")
	private Boolean hasRepresentativeName;

	@Column(name = "has_company_seal")
	private Boolean hasCompanySeal;

	@Column(name = "subscriber_type", length = 30)
	private String subscriberType;

	@Column(name = "latest_acquisition_date")
	private LocalDate latestAcquisitionDate;

	@Column(name = "latest_loss_date", length = 20)
	private String latestLossDate;

	@Column(name = "work_period", length = 50)
	private String workPeriod;

	@Column(name = "annual_income_total")
	private Long annualIncomeTotal;
}

