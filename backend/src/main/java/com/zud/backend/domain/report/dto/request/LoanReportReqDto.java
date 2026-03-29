package com.zud.backend.domain.report.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.zud.backend.domain.report.enums.EmploymentType;

public record LoanReportReqDto(
	@JsonProperty("consultationId")
	UUID consultationId,
	ReportInput reportInput
) {
	public record ReportInput(
		String headOfHouseholdName,
		List<HouseholdMember> householdMembers,
		EmploymentType employmentType,
		String currentAddress,
		String name,
		String residentRegistrationNumber,
		Integer ownedHouseCount,
		Spouse spouse,
		Boolean hasRepresentativeName,
		Boolean hasCompanySeal,
		String subscriberType,
		@JsonFormat(pattern = "yyyy-MM-dd")
		LocalDate latestAcquisitionDate,
		@JsonFormat(pattern = "yyyy-MM-dd")
		LocalDate latestLossDate,
		String incomeRecipientName,
		String incomeRecipientResidentRegistrationNumber,
		String workPeriod,
		Long annualIncomeTotal,
		String businessName,
		String businessRegistrationNumber,
		String incomeYear,
		Long incomeAmount,
		Long taxableSalesAmount,
		Boolean manualReviewRequired,
		List<TaxItem> taxItems,
		String registrationType,
		String buildingType,
		Boolean hasDongho,
		String lotAddress,
		Boolean hasLandRightCause,
		Boolean hasOwnershipTransferClaim,
		Boolean hasTrustRegistration,
		String ownerName,
		Deposit deposit,
		List<SeniorRight> seniorRights,
		Boolean isViolationBuilding,
		String mainUsage,
		List<FloorStatus> floorStatusList,
		String propertyAddress,
		Long salePrice,
		String specialTerms,
		Seller seller,
		Buyer buyer,
		Long collateralMarketPrice,
		Long totalRemainingLoanBalance,
		Long monthlyRepaymentAmount,
		String creditRating,
		Long annualPrincipalAndInterestRepayment
	) {
	}

	public record HouseholdMember(
		String name,
		String residentRegistrationNumber
	) {
	}

	public record Spouse(
		Boolean exists,
		String name,
		String residentRegistrationNumber
	) {
	}

	public record Deposit(
		Boolean hasDeposit,
		Long depositAmount
	) {
	}

	public record TaxItem(
		String taxItemName,
		Long taxAmount,
		String remark
	) {
	}

	public record SeniorRight(
		Long maximumClaimAmount
	) {
	}

	public record FloorStatus(
		String floor,
		String usage,
		BigDecimal area
	) {
	}

	public record Seller(
		String name
	) {
	}

	public record Buyer(
		String name
	) {
	}
}