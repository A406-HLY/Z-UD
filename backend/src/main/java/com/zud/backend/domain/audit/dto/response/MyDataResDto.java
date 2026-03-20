package com.zud.backend.domain.audit.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MyDataResDto(
	String userId,
	String ratingName,

	@JsonProperty("loanProducts")
	List<LoanProductResDto> loanProducts
) {
	public record LoanProductResDto(
		String accountNo,
		String accountName,
		String loanBalance,
		String remainingLoanBalance
	) {
	}
}
