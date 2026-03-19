package com.zud.backend.domain.audit.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MyDataResDto(
	String userId,
	String ratingName,

	@JsonProperty("loanProduct")
	LoanProductResDto loanProduct
) {
	public record LoanProductResDto(
		String accountNo,
		String accountName,
		String loanBalance,
		String remainingLoanBalance
	) {
	}
}
