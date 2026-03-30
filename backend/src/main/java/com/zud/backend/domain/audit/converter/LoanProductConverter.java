package com.zud.backend.domain.audit.converter;

import com.zud.backend.domain.audit.dto.external.response.ExternalInquireLoanAccountListResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalInquireRepaymentRecordsResDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class LoanProductConverter {

	public MyDataResDto.LoanProductResDto toLoanProductResDto(
		final ExternalInquireLoanAccountListResDto.Rec account,
		final ExternalInquireRepaymentRecordsResDto repaymentRecords,
		final long annualPrincipalAndInterestRepayment
	) {
		String accountName = account.accountName();
		long loanBalance = parseAmount(account.loanBalance());
		long remainingLoanBalance = 0L;

		if (repaymentRecords != null && repaymentRecords.rec() != null) {
			accountName = repaymentRecords.rec().accountName();
			loanBalance = parseAmount(repaymentRecords.rec().loanBalance());
			remainingLoanBalance = parseAmount(repaymentRecords.rec().remainingLoanBalance());
		}

		return new MyDataResDto.LoanProductResDto(
			account.accountNo(),
			accountName,
			loanBalance,
			remainingLoanBalance,
			annualPrincipalAndInterestRepayment
		);
	}

	private long parseAmount(final String amount) {
		if (amount == null || amount.isBlank()) {
			return 0L;
		}
		try {
			return Long.parseLong(amount);
		} catch (NumberFormatException e) {
			return 0L;
		}
	}
}
