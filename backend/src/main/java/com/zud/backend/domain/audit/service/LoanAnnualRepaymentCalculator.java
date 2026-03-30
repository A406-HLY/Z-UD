package com.zud.backend.domain.audit.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Component;

import com.zud.backend.domain.audit.dto.external.response.ExternalInquireLoanAccountListResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalInquireRepaymentRecordsResDto;

@Component
public class LoanAnnualRepaymentCalculator {

	private static final String SUCCESS_STATUS = "SUCCESS";
	private static final long MONTHS_IN_YEAR = 12L;

	public long calculateAnnualPrincipalAndInterestRepayment(
		final ExternalInquireLoanAccountListResDto.Rec account,
		final ExternalInquireRepaymentRecordsResDto repaymentRecords
	) {
		if (account == null || repaymentRecords == null || repaymentRecords.rec() == null) {
			return 0L;
		}

		long totalLoanPeriodMonths = parseAmount(account.loanPeriod());
		long remainingLoanBalance = parseAmount(repaymentRecords.rec().remainingLoanBalance());
		long successRepaymentCount = countSuccessRepayments(repaymentRecords.rec().repaymentRecords());
		long remainingMonths = totalLoanPeriodMonths - successRepaymentCount;

		if (remainingLoanBalance <= 0L || remainingMonths <= 0L) {
			return 0L;
		}

		if (remainingMonths <= MONTHS_IN_YEAR) {
			return remainingLoanBalance;
		}

		return BigDecimal.valueOf(remainingLoanBalance)
			.multiply(BigDecimal.valueOf(MONTHS_IN_YEAR))
			.divide(BigDecimal.valueOf(remainingMonths), 0, RoundingMode.HALF_UP)
			.longValue();
	}

	private long countSuccessRepayments(final List<ExternalInquireRepaymentRecordsResDto.RepaymentRecord> records) {
		if (records == null || records.isEmpty()) {
			return 0L;
		}
		return records.stream()
			.filter(record -> SUCCESS_STATUS.equals(record.status()))
			.count();
	}

	private long parseAmount(final String value) {
		if (value == null || value.isBlank()) {
			return 0L;
		}
		try {
			return Long.parseLong(value);
		} catch (NumberFormatException e) {
			return 0L;
		}
	}
}
