package com.zud.backend.domain.audit.dto.external.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExternalInquireRepaymentRecordsResDto(
	@JsonProperty("Header")
	ExternalHeaderResDto header,

	@JsonProperty("REC")
	Rec rec
) {
	public record Rec(
		String accountNo,
		String accountName,
		String status,
		String accountTypeUniqueNo,
		String loanBalance,
		String remainingLoanBalance,
		String withdrawalAccountNo,
		List<RepaymentRecord> repaymentRecords
	) {
	}

	public record RepaymentRecord(
		String installmentNumber,
		String status,
		String paymentBalance,
		String repaymentAttemptDate,
		String repaymentAttemptTime,
		String repaymentActualDate,
		String repaymentActualTime,
		String failureReason
	) {
	}
}
