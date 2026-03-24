package com.zud.backend.domain.report.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.zud.backend.domain.report.enums.EmploymentType;
import com.zud.backend.domain.report.validation.ValidLoanReportReq;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record LoanReportReqDto(
	@JsonProperty("UUID")
	@NotNull(message = "UUID는 필수입니다.")
	UUID uuid,

	@NotNull(message = "report input 값은 필수입니다.")
	@Valid
	ReportInput reportInput
) {
	@ValidLoanReportReq
	public record ReportInput(
		@NotBlank(message = "세대주명은 필수입니다.")
		String headOfHouseholdName,

		@NotEmpty(message = "세대원 목록은 비어 있을 수 없습니다.")
		@Valid
		List<HouseholdMember> householdMembers,

		@NotNull(message = "근로 형태는 필수입니다.")
		EmploymentType employmentType,

		@NotBlank(message = "현재 주소는 필수입니다.")
		String currentAddress,

		@NotBlank(message = "이름은 필수입니다.")
		String name,

		@NotBlank(message = "주민등록번호는 필수입니다.")
		String residentRegistrationNumber,

		@NotNull(message = "배우자 정보는 필수입니다.")
		@Valid
		Spouse spouse,

		@NotNull(message = "대표자명 일치 여부는 필수입니다.")
		Boolean representativeName,

		@NotNull(message = "직인 여부는 필수입니다.")
		Boolean hasCompanySeal,

		String subscriberType,
		@JsonFormat(pattern = "yyyy-MM-dd")
		LocalDate latestAcquisitionDate,
		@JsonFormat(pattern = "yyyy-MM-dd")
		LocalDate latestLossDate,
		String incomeRecipientName,
		String incomeRecipientResidentRegistrationNumber,
		String workPeriod,
		@PositiveOrZero(message = "연소득 합계는 0 이상이어야 합니다.")
		Long annualIncomeTotal,

		String businessName,
		String businessRegistrationNumber,
		String incomeYear,
		@PositiveOrZero(message = "소득 금액은 0 이상이어야 합니다.")
		Long incomeAmount,
		@PositiveOrZero(message = "결정세액은 0 이상이어야 합니다.")
		Long determinedTaxAmount,
		String corporateRegistrationNumber,
		@PositiveOrZero(message = "과세표준 매출액은 0 이상이어야 합니다.")
		Long taxableSalesAmount,

		@NotEmpty(message = "입금 내역은 비어 있을 수 없습니다.")
		@Valid
		List<DepositAmount> depositAmountList,

		@NotNull(message = "수기 심사 여부는 필수입니다.")
		Boolean manualReviewRequired,

		@NotBlank(message = "등록번호는 필수입니다.")
		String registrationNumber,

		@NotBlank(message = "식별번호는 필수입니다.")
		String identifierNumber,

		@NotEmpty(message = "세금 항목은 비어 있을 수 없습니다.")
		@Valid
		List<TaxItem> taxItems,

		@NotBlank(message = "등기 유형은 필수입니다.")
		String registrationType,

		@NotBlank(message = "건물 유형은 필수입니다.")
		String buildingType,

		@NotNull(message = "동호수 포함 여부는 필수입니다.")
		Boolean hasDongho,

		@NotBlank(message = "지번 주소는 필수입니다.")
		String lotAddress,

		@NotNull(message = "대지권 원인 여부는 필수입니다.")
		Boolean hasLandRightCause,

		@NotNull(message = "소유권이전청구권 여부는 필수입니다.")
		Boolean hasOwnershipTransferClaim,

		@NotNull(message = "신탁등기 여부는 필수입니다.")
		Boolean hasTrustRegistration,

		@NotBlank(message = "소유자명은 필수입니다.")
		String ownerName,

		@NotEmpty(message = "선순위 권리 정보는 비어 있을 수 없습니다.")
		@Valid
		List<SeniorRight> seniorRights,

		@NotNull(message = "위반건축물 여부는 필수입니다.")
		Boolean isViolationBuilding,

		@NotBlank(message = "주용도는 필수입니다.")
		String mainUsage,

		@NotEmpty(message = "층별 현황은 비어 있을 수 없습니다.")
		@Valid
		List<FloorStatus> floorStatusList,

		@NotBlank(message = "부동산 주소는 필수입니다.")
		String propertyAddress,

		@NotNull(message = "매매 가격은 필수입니다.")
		@PositiveOrZero(message = "매매 가격은 0 이상이어야 합니다.")
		Long salePrice,

		String specialTerms,

		@NotNull(message = "매도인 정보는 필수입니다.")
		@Valid
		Seller seller,

		@NotNull(message = "매수인 정보는 필수입니다.")
		@Valid
		Buyer buyer,

		@NotBlank(message = "조사 주소는 필수입니다.")
		String inspectionAddress,

		@NotEmpty(message = "전입세대 정보는 비어 있을 수 없습니다.")
		@Valid
		List<MoveInHousehold> moveInHouseholds,

		@NotNull(message = "담보 시세는 필수입니다.")
		@PositiveOrZero(message = "담보 시세는 0 이상이어야 합니다.")
		Long collateralMarketPrice,

		@NotNull(message = "총 대출 잔액은 필수입니다.")
		@PositiveOrZero(message = "총 대출 잔액은 0 이상이어야 합니다.")
		Long totalLoanBalance,

		@NotNull(message = "월 상환액은 필수입니다.")
		@PositiveOrZero(message = "월 상환액은 0 이상이어야 합니다.")
		Long monthlyRepaymentAmount,

		@NotBlank(message = "신용등급은 필수입니다.")
		String creditRating,

		@NotNull(message = "연간 원리금 상환액은 필수입니다.")
		@PositiveOrZero(message = "연간 원리금 상환액은 0 이상이어야 합니다.")
		Long annualPrincipalAndInterestRepayment
	) {
	}

	public record HouseholdMember(
		@NotBlank(message = "세대원 이름은 필수입니다.")
		String name,
		@NotBlank(message = "세대원 주민등록번호는 필수입니다.")
		String residentRegistrationNumber
	) { }

	public record Spouse(
		@NotNull(message = "배우자 존재 여부는 필수입니다.")
		Boolean exists,
		String name,
		String residentRegistrationNumber
	) { }

	public record DepositAmount(
		@NotNull(message = "입금일은 필수입니다.")
		@JsonFormat(pattern = "yyyy-MM-dd")
		LocalDate depositDate,
		@NotNull(message = "입금액은 필수입니다.")
		@PositiveOrZero(message = "입금액은 0 이상이어야 합니다.")
		Long depositAmount
	) { }

	public record TaxItem(
		@NotBlank(message = "세목명은 필수입니다.")
		String taxItemName,
		@NotNull(message = "세액은 필수입니다.")
		@PositiveOrZero(message = "세액은 0 이상이어야 합니다.")
		Long taxAmount,
		String remark
	) { }

	public record SeniorRight(
		@NotNull(message = "채권최고액은 필수입니다.")
		@PositiveOrZero(message = "채권최고액은 0 이상이어야 합니다.")
		Long maximumClaimAmount
	) { }

	public record FloorStatus(
		@NotBlank(message = "층 정보는 필수입니다.")
		String floor,
		@NotBlank(message = "용도는 필수입니다.")
		String usage,
		@NotNull(message = "면적은 필수입니다.")
		@PositiveOrZero(message = "면적은 0 이상이어야 합니다.")
		BigDecimal area
	) { }

	public record Seller(
		@NotBlank(message = "매도인 이름은 필수입니다.")
		String name
	) { }

	public record Buyer(
		@NotBlank(message = "매수인 이름은 필수입니다.")
		String name
	) { }

	public record MoveInHousehold(
		@NotBlank(message = "전입세대 세대주명은 필수입니다.")
		String headOfHouseholdName,
		@NotNull(message = "전입일은 필수입니다.")
		@JsonFormat(pattern = "yyyy-MM-dd")
		LocalDate moveInDate
	) { }
}
