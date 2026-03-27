package com.zud.backend.domain.consultation.entity;

import com.zud.backend.domain.consultation.enums.EmploymentType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
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
@Table(name = "consultation_transfers")
public class ConsultationTransfer {

	@Id
	@Column(name = "consultation_id", nullable = false, updatable = false, length = 36)
	private String consultationId;

	@Column(name = "employment_type", nullable = false, length = 50)
	@Enumerated(EnumType.STRING)
	private EmploymentType employmentType;

	@Column(name = "manual_review_required")
	private Boolean manualReviewRequired;

	@Column(name = "collateral_market_price")
	private Long collateralMarketPrice;

	@Column(name = "total_remaining_loan_balance")
	private Long totalRemainingLoanBalance;

	@Column(name = "credit_rating", length = 20)
	private String creditRating;

	@Column(name = "annual_principal_and_interest_repayment")
	private Long annualPrincipalAndInterestRepayment;

	@Lob
	@Column(name = "report_input_json", columnDefinition = "TEXT")
	private String reportInputJson;

	@OneToOne(mappedBy = "transfer", cascade = CascadeType.ALL, orphanRemoval = true)
	private ConsultationTransferEmployeeDetail employeeDetail;

	@OneToOne(mappedBy = "transfer", cascade = CascadeType.ALL, orphanRemoval = true)
	private ConsultationTransferSelfEmployedDetail selfEmployedDetail;

	public void assignEmployeeDetail(final ConsultationTransferEmployeeDetail detail) {
		this.employeeDetail = detail;
		this.selfEmployedDetail = null;
	}

	public void assignSelfEmployedDetail(final ConsultationTransferSelfEmployedDetail detail) {
		this.selfEmployedDetail = detail;
		this.employeeDetail = null;
	}
}

