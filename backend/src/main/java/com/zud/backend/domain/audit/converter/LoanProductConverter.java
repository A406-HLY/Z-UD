package com.zud.backend.domain.audit.converter;

import com.zud.backend.domain.audit.dto.external.response.ExternalInquireLoanAccountListResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalInquireRepaymentRecordsResDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class LoanProductConverter {

	public MyDataResDto.LoanProductResDto toLoanProductResDto(
		final ExternalInquireLoanAccountListResDto.Rec account,
		final ExternalInquireRepaymentRecordsResDto repaymentRecords
	) {
		String accountName = account.accountName();
		String loanBalance = account.loanBalance();
		String remainingLoanBalance = null;

		if (repaymentRecords != null && repaymentRecords.rec() != null) {
			accountName = repaymentRecords.rec().accountName();
			loanBalance = repaymentRecords.rec().loanBalance();
			remainingLoanBalance = repaymentRecords.rec().remainingLoanBalance();
		}

		return new MyDataResDto.LoanProductResDto(
			account.accountNo(),
			accountName,
			loanBalance,
			remainingLoanBalance
		);
	}
}
