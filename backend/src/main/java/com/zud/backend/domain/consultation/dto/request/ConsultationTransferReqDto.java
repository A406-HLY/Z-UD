package com.zud.backend.domain.consultation.dto.request;

import java.time.LocalDate;
import java.util.List;

import com.zud.backend.domain.consultation.dto.request.deserializer.ConsultationTransferReqDtoDeserializer;
import com.zud.backend.domain.consultation.enums.EmploymentType;
import com.zud.backend.domain.consultation.enums.LoanPurpose;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import tools.jackson.databind.annotation.JsonDeserialize;

@Builder
@JsonDeserialize(using = ConsultationTransferReqDtoDeserializer.class)
@Schema(description = "전산 이관 요청 DTO")
public record ConsultationTransferReqDto(
	@Schema(description = "고용형태별 전산 이관 상세 입력")
	@Valid @NotNull TransferReportInput reportInput
) {

	public sealed interface TransferReportInput permits EmployeeReportInput, SelfEmployedReportInput {
		// 고객 기본 정보
		String name();

		String residentRegistrationNumber();

		String phoneNumber();

		Long targetLoanAmount();

		LoanPurpose loanPurpose();

		Integer ownedHouseCount();

		// 신분증 정보
		LocalDate issueDate();

		String issueNumber();

		// 가족 정보
		List<HouseholdMember> householdMembers();

		Spouse spouse();

		// 주소 정보
		String currentAddress();

		LocalDate moveInDate();

		// 등기 정보
		String registrationType();

		Boolean hasDongho();

		String buildingType();

		String lotAddress();

		Boolean hasLandRightCause();

		Boolean hasOwnershipTransferClaim();

		Boolean hasTrustRegistration();

		String ownerName();

		Deposit deposit();

		List<SeniorRight> seniorRights();

		Boolean isViolationBuilding();

		String mainUsage();

		List<FloorStatus> floorStatusList();

		// 매매 정보
		String propertyAddress();

		Long salePrice();

		String specialTerms();

		PersonName seller();

		PersonName buyer();

		List<TaxItem> taxItems();

		// 고용 및 심사 정보
		EmploymentType employmentType();

		Boolean manualReviewRequired();

		Long collateralMarketPrice();

		Long totalRemainingLoanBalance();

		String creditRating();

		Long annualPrincipalAndInterestRepayment();
	}

	@Builder
	@Schema(description = "근로자 전산 이관 입력")
	public record EmployeeReportInput(
		@Schema(description = "고객명", example = "홍길동")
		@NotBlank(message = "고객명은 필수 입력값 입니다.")
		String name,

		@Schema(description = "주민등록번호", example = "900101-1234567")
		@NotBlank(message = "주민등록번호는 필수 입력값 입니다.")
		@Pattern(regexp = "^\\d{6}-\\d{7}$", message = "주민등록번호 형식은 000000-0000000 이어야 합니다.")
		String residentRegistrationNumber,

		@Schema(description = "휴대폰 번호", example = "010-1234-5678")
		@NotBlank(message = "휴대폰 번호는 필수 입력값 입니다.")
		@Pattern(regexp = "^01\\d-\\d{3,4}-\\d{4}$", message = "휴대폰 번호 형식은 010-0000-0000 이어야 합니다.")
		String phoneNumber,

		@Schema(description = "목표 대출 금액(원)", example = "200000000")
		@NotNull(message = "목표 대출 금액은 필수 입력값 입니다.")
		@Positive(message = "목표 대출 금액은 0보다 커야 합니다.")
		Long targetLoanAmount,

		@Schema(description = "대출 목적", example = "HOME_PURCHASE")
		@NotNull(message = "대출 목적은 필수 입력값 입니다.")
		LoanPurpose loanPurpose,

		@Schema(description = "보유 주택 수", example = "0")
		@NotNull(message = "보유 주택 수는 필수 입력값 입니다.")
		Integer ownedHouseCount,

		@Schema(description = "신분증 발급일", example = "2026-03-25")
		LocalDate issueDate,

		@Schema(description = "신분증 발급번호", example = "2026-123456789")
		String issueNumber,

		@Schema(description = "세대원 목록")
		@Valid
		List<HouseholdMember> householdMembers,

		@Schema(description = "현 거주지 주소", example = "서울특별시 강남구 테헤란로 123")
		String currentAddress,

		@Schema(description = "전입일", example = "2025-01-15")
		LocalDate moveInDate,

		@Schema(description = "배우자 정보")
		@Valid Spouse spouse,

		@Schema(description = "등기 유형", example = "집합건물")
		String registrationType,

		@Schema(description = "동/호수 포함 여부", example = "true")
		Boolean hasDongho,

		@Schema(description = "건물 유형", example = "아파트")
		String buildingType,

		@Schema(description = "지번 주소", example = "서울특별시 강남구 역삼동 456")
		String lotAddress,

		@Schema(description = "대지권 원인 기재 여부", example = "false")
		Boolean hasLandRightCause,

		@Schema(description = "소유권이전청구권 기재 여부", example = "false")
		Boolean hasOwnershipTransferClaim,

		@Schema(description = "신탁등기 여부", example = "false")
		Boolean hasTrustRegistration,

		@Schema(description = "등기상 소유자명", example = "이철수")
		String ownerName,

		@Schema(description = "임차보증금 정보")
		@Valid Deposit deposit,

		@Schema(description = "선순위 권리 목록")
		@Valid List<SeniorRight> seniorRights,

		@Schema(description = "위반건축물 여부", example = "false")
		Boolean isViolationBuilding,

		@Schema(description = "주용도", example = "공동주택")
		String mainUsage,

		@Schema(description = "층별 현황 목록")
		@Valid List<FloorStatus> floorStatusList,

		@Schema(description = "대상 부동산 주소", example = "서울특별시 강남구 테헤란로 123, 101동 502호")
		String propertyAddress,

		@Schema(description = "매매가(원)", example = "1000000000")
		Long salePrice,

		@Schema(description = "특약사항", example = "잔금 지급 전 근저당권 말소 조건")
		String specialTerms,

		@Schema(description = "매도인 정보")
		@Valid PersonName seller,

		@Schema(description = "매수인 정보")
		@Valid PersonName buyer,

		@Schema(description = "세목 목록")
		@Valid List<TaxItem> taxItems,

		@Schema(description = "고용 형태", example = "EMPLOYEE")
		@NotNull(message = "고용 형태는 필수 입력값 입니다.")
		EmploymentType employmentType,

		@Schema(description = "사업장 대표자명 기재 여부", example = "true")
		Boolean hasRepresentativeName,

		@Schema(description = "직인 날인 여부", example = "true")
		Boolean hasCompanySeal,

		@Schema(description = "건강보험 가입자 유형", example = "직장가입자")
		String subscriberType,

		@Schema(description = "최근 취득일", example = "2020-03-01")
		LocalDate latestAcquisitionDate,

		@Schema(description = "최근 상실일", example = "")
		String latestLossDate,

		@Schema(description = "근무 기간", example = "2025.01.01-2025.12.31")
		String workPeriod,

		@Schema(description = "연간 총소득(원)", example = "70000000")
		Long annualIncomeTotal,

		@Schema(description = "수기 심사 필요 여부", example = "false")
		Boolean manualReviewRequired,

		@Schema(description = "담보 시세(원)", example = "900000000")
		Long collateralMarketPrice,

		@Schema(description = "총 잔여 대출 잔액(원)", example = "150000000")
		Long totalRemainingLoanBalance,

		@Schema(description = "신용 등급", example = "A")
		String creditRating,

		@Schema(description = "연간 원리금 상환액(원)", example = "14400000")
		Long annualPrincipalAndInterestRepayment
	) implements TransferReportInput {
	}

	@Builder
	@Schema(description = "개인사업자 전산 이관 입력")
	public record SelfEmployedReportInput(
		@Schema(description = "고객명", example = "홍길동")
		@NotBlank(message = "고객명은 필수 입력값 입니다.")
		String name,

		@Schema(description = "주민등록번호", example = "900101-1234567")
		@NotBlank(message = "주민등록번호는 필수 입력값 입니다.")
		@Pattern(regexp = "^\\d{6}-\\d{7}$", message = "주민등록번호 형식은 000000-0000000 이어야 합니다.")
		String residentRegistrationNumber,

		@Schema(description = "휴대폰 번호", example = "010-1234-5678")
		@NotBlank(message = "휴대폰 번호는 필수 입력값 입니다.")
		@Pattern(regexp = "^01\\d-\\d{3,4}-\\d{4}$", message = "휴대폰 번호 형식은 010-0000-0000 이어야 합니다.")
		String phoneNumber,

		@Schema(description = "목표 대출 금액(원)", example = "200000000")
		@NotNull(message = "목표 대출 금액은 필수 입력값 입니다.")
		@Positive(message = "목표 대출 금액은 0보다 커야 합니다.")
		Long targetLoanAmount,

		@Schema(description = "대출 목적", example = "HOME_PURCHASE")
		@NotNull(message = "대출 목적은 필수 입력값 입니다.")
		LoanPurpose loanPurpose,

		@Schema(description = "보유 주택 수", example = "0")
		@NotNull(message = "보유 주택 수는 필수 입력값 입니다.")
		Integer ownedHouseCount,

		@Schema(description = "신분증 발급일", example = "2026-03-25")
		LocalDate issueDate,

		@Schema(description = "신분증 발급번호", example = "2026-123456789")
		String issueNumber,

		@Schema(description = "세대원 목록")
		@Valid List<HouseholdMember> householdMembers,

		@Schema(description = "현 거주지 주소", example = "서울특별시 강남구 테헤란로 123")
		String currentAddress,

		@Schema(description = "전입일", example = "2025-01-15")
		LocalDate moveInDate,

		@Schema(description = "배우자 정보")
		@Valid Spouse spouse,

		@Schema(description = "등기 유형", example = "집합건물")
		String registrationType,

		@Schema(description = "동/호수 포함 여부", example = "true")
		Boolean hasDongho,

		@Schema(description = "건물 유형", example = "아파트")
		String buildingType,

		@Schema(description = "지번 주소", example = "서울특별시 강남구 역삼동 456")
		String lotAddress,

		@Schema(description = "대지권 원인 기재 여부", example = "false")
		Boolean hasLandRightCause,

		@Schema(description = "소유권이전청구권 기재 여부", example = "false")
		Boolean hasOwnershipTransferClaim,

		@Schema(description = "신탁등기 여부", example = "false")
		Boolean hasTrustRegistration,

		@Schema(description = "등기상 소유자명", example = "이철수")
		String ownerName,

		@Schema(description = "임차보증금 정보")
		@Valid Deposit deposit,

		@Schema(description = "선순위 권리 목록")
		@Valid List<SeniorRight> seniorRights,

		@Schema(description = "위반건축물 여부", example = "false")
		Boolean isViolationBuilding,

		@Schema(description = "주용도", example = "공동주택")
		String mainUsage,

		@Schema(description = "층별 현황 목록")
		@Valid List<FloorStatus> floorStatusList,

		@Schema(description = "대상 부동산 주소", example = "서울특별시 강남구 테헤란로 123, 101동 502호")
		String propertyAddress,

		@Schema(description = "매매가(원)", example = "1000000000")
		Long salePrice,

		@Schema(description = "특약사항", example = "잔금 지급 전 근저당권 말소 조건")
		String specialTerms,

		@Schema(description = "매도인 정보")
		@Valid PersonName seller,

		@Schema(description = "매수인 정보")
		@Valid PersonName buyer,

		@Schema(description = "세목 목록")
		@Valid List<TaxItem> taxItems,

		@Schema(description = "고용 형태", example = "SELF_EMPLOYED")
		@NotNull(message = "고용 형태는 필수 입력값 입니다.")
		EmploymentType employmentType,

		@Schema(description = "상호명", example = "홍길상회")
		String businessName,

		@Schema(description = "사업자등록번호", example = "123-45-67890")
		String businessRegistrationNumber,

		@Schema(description = "소득 귀속연도", example = "2025")
		String incomeYear,

		@Schema(description = "소득 금액(원)", example = "85000000")
		Long incomeAmount,

		@Schema(description = "과세 매출액(원)", example = "300000000")
		Long taxableSalesAmount,

		@Schema(description = "수기 심사 필요 여부", example = "false")
		Boolean manualReviewRequired,

		@Schema(description = "담보 시세(원)", example = "900000000")
		Long collateralMarketPrice,

		@Schema(description = "총 잔여 대출 잔액(원)", example = "150000000")
		Long totalRemainingLoanBalance,

		@Schema(description = "신용 등급", example = "A")
		String creditRating,

		@Schema(description = "연간 원리금 상환액(원)", example = "14400000")
		Long annualPrincipalAndInterestRepayment
	) implements TransferReportInput {
	}

	@Builder
	@Schema(description = "세대원 정보")
	public record HouseholdMember(
		@Schema(description = "세대원 이름", example = "홍길동")
		String name,

		@Schema(description = "세대원 주민등록번호", example = "900101-1234567")
		String residentRegistrationNumber
	) {
	}

	@Builder
	@Schema(description = "배우자 정보")
	public record Spouse(
		@Schema(description = "배우자 존재 여부", example = "true")
		Boolean exists,

		@Schema(description = "배우자 이름", example = "김지영")
		String name,

		@Schema(description = "배우자 주민등록번호", example = "920505-2345678")
		String residentRegistrationNumber
	) {
	}

	@Builder
	@Schema(description = "임차보증금 정보")
	public record Deposit(
		@Schema(description = "보증금 존재 여부", example = "true")
		Boolean hasDeposit,

		@Schema(description = "보증금 금액(원)", example = "50000000")
		Long depositAmount
	) {
	}

	@Builder
	@Schema(description = "선순위 권리 정보")
	public record SeniorRight(
		@Schema(description = "채권최고액(원)", example = "100000000")
		Long maximumClaimAmount
	) {
	}

	@Builder
	@Schema(description = "층별 현황 정보")
	public record FloorStatus(
		@Schema(description = "층", example = "5층")
		String floor,

		@Schema(description = "용도", example = "아파트")
		String usage,

		@Schema(description = "면적(㎡)", example = "84.5")
		Double area
	) {
	}

	@Builder
	@Schema(description = "이름 정보")
	public record PersonName(
		@Schema(description = "이름", example = "이철수")
		String name
	) {
	}

	@Builder
	@Schema(description = "세목 정보")
	public record TaxItem(
		@Schema(description = "세목명", example = "취득세")
		String taxItemName,

		@Schema(description = "세액(원)", example = "30000000")
		Long taxAmount,

		@Schema(description = "비고", example = "납부완료")
		String remark
	) {
	}
}
