package com.zud.backend.domain.audit.validation;

import com.zud.backend.domain.audit.dto.request.LoanReportReqDto;
import com.zud.backend.domain.audit.enums.EmploymentType;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class LoanReportReqValidator
	implements ConstraintValidator<ValidLoanReportReq, LoanReportReqDto.ReportInput> {
	@Override
	public boolean isValid(LoanReportReqDto.ReportInput request, ConstraintValidatorContext context) {
		if (request == null) {
			return true;
		}

		boolean valid = true;
		context.disableDefaultConstraintViolation();

		if (request.employmentType() == EmploymentType.EMPLOYEE) {
			valid &= requireNotBlank(request.subscriberType(), "subscriberType", "근로자의 가입자 구분은 필수입니다.", context);
			valid &= requireNotNull(request.latestAcquisitionDate(), "latestAcquisitionDate", "근로자의 최종 취득일은 필수입니다.", context);
			valid &= requireNotBlank(request.incomeRecipientName(), "incomeRecipientName", "근로자의 소득수령자명은 필수입니다.", context);
			valid &= requireNotBlank(
				request.incomeRecipientResidentRegistrationNumber(),
				"incomeRecipientResidentRegistrationNumber",
				"근로자의 소득수령자 주민등록번호는 필수입니다.",
				context
			);
			valid &= requireNotBlank(request.workPeriod(), "workPeriod", "근로자의 근무기간은 필수입니다.", context);
			valid &= requireNotNull(request.annualIncomeTotal(), "annualIncomeTotal", "근로자의 연소득 합계는 필수입니다.", context);
		}

		if (request.employmentType() == EmploymentType.SELF_EMPLOYED) {
			valid = requireNotBlank(request.businessName(), "businessName", "상호명은 필수입니다.", context);
			valid &= requireNotBlank(request.businessRegistrationNumber(), "businessRegistrationNumber", "사업자등록번호는 필수입니다.", context);
			valid &= requireNotBlank(request.incomeYear(), "incomeYear", "소득 귀속연도는 필수입니다.", context);
			valid &= requireNotNull(request.incomeAmount(), "incomeAmount", "소득 금액은 필수입니다.", context);
			valid &= requireNotNull(request.determinedTaxAmount(), "determinedTaxAmount", "결정세액은 필수입니다.", context);
			valid &= requireNotNull(request.taxableSalesAmount(), "taxableSalesAmount", "과세표준 매출액은 필수입니다.", context);
		}

		if (request.spouse() != null && Boolean.TRUE.equals(request.spouse().exists())) {
			valid &= requireNotBlank(request.spouse().name(), "spouse.name", "배우자 이름은 필수입니다.", context);
			valid &= requireNotBlank(
				request.spouse().residentRegistrationNumber(),
				"spouse.residentRegistrationNumber",
				"배우자 주민등록번호는 필수입니다.",
				context
			);
		}

		return valid;
	}

	private boolean requireNotBlank(
		String value,
		String fieldName,
		String message,
		ConstraintValidatorContext context
	) {
		if (value == null || value.isBlank()) {
			context.buildConstraintViolationWithTemplate(message)
				.addPropertyNode(fieldName)
				.addConstraintViolation();
			return false;
		}
		return true;
	}

	private boolean requireNotNull(
		Object value,
		String fieldName,
		String message,
		ConstraintValidatorContext context
	) {
		if (value == null) {
			context.buildConstraintViolationWithTemplate(message)
				.addPropertyNode(fieldName)
				.addConstraintViolation();
			return false;
		}
		return true;
	}
}
