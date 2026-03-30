package com.zud.backend.domain.audit.dto.external.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExternalInquireLoanAccountListResDto(
	@JsonProperty("Header")
	ExternalHeaderResDto header,

	@JsonProperty("REC")
	List<Rec> rec
) {
	public record Rec(
		String accountNo,
		String accountName,
		String status,
		String accountTypeUniqueNo,
		String loanPeriod,
		String loanDate,
		String maturityDate,
		String loanBalance,
		String interestRate,
		String withdrawalAccountNo
	) {
	}
}
