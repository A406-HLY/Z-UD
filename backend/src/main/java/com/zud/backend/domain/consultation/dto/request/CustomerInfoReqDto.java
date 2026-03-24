package com.zud.backend.domain.consultation.dto.request;

import com.zud.backend.domain.consultation.enums.EmploymentType;
import com.zud.backend.domain.consultation.enums.LoanPurpose;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

@Schema(description = "고객 정보 입력 요청 DTO")
public record CustomerInfoReqDto(
	@Schema(description = "외부 상담 UUID(v4)", example = "550e8400-e29b-41d4-a716-446655440000")
	@NotBlank(message = "상담 UUID는 필수 입력값 입니다.")
	@Pattern(
		regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
		message = "상담 UUID는 UUID v4 형식이어야 합니다."
	)
	String consultationId,

	@Schema(description = "고객명", example = "홍길동")
	@NotBlank(message = "고객명은 필수 입력값 입니다.")
	String name,

	@Schema(description = "주민등록번호", example = "900101-1234567", accessMode = Schema.AccessMode.WRITE_ONLY)
	@NotBlank(message = "주민등록번호는 필수 입력값 입니다.")
	@Pattern(regexp = "^\\d{6}-\\d{7}$", message = "주민등록번호 형식은 000000-0000000 이어야 합니다.")
	String residentRegistrationNumber,

	@Schema(description = "휴대폰 번호", example = "010-1234-5678")
	@NotBlank(message = "휴대폰 번호는 필수 입력값 입니다.")
	@Pattern(regexp = "^01\\d-\\d{3,4}-\\d{4}$", message = "휴대폰 번호 형식은 010-0000-0000 이어야 합니다.")
	String phoneNumber,

	@Schema(description = "고용 형태", example = "EMPLOYEE")
	@NotNull(message = "고용 형태는 필수 입력값 입니다.")
	EmploymentType employmentType,

	@Schema(description = "목표 대출 금액(원)", example = "300000000")
	@NotNull(message = "목표 대출 금액은 필수 입력값 입니다.")
	@Positive(message = "목표 대출 금액은 0보다 커야 합니다.")
	Long targetLoanAmount,

	@Schema(description = "대출 목적", example = "HOME_PURCHASE")
	@NotNull(message = "대출 목적은 필수 입력값 입니다.")
	LoanPurpose loanPurpose,

	@Schema(description = "보유 주택 수", example = "1")
	@NotNull(message = "보유 주택 수는 필수 입력값 입니다.")
	@Min(value = 0, message = "보유 주택 수는 0 이상이어야 합니다.")
	Integer ownedHouseCount
) {
}
