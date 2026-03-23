package com.zud.backend.domain.audit.converter;

import java.util.List;

import com.zud.backend.domain.audit.dto.response.MyDataResDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class MyDataConverter {

	public MyDataResDto toMyDataResDto(
		final String userId,
		final String ratingName,
		final List<MyDataResDto.LoanProductResDto> loanProducts
	) {
		long totalLoanBalance = 0L;
		long totalRemainingLoanBalance = 0L;
		long totalAnnualPrincipalAndInterestRepayment = 0L;

		for (MyDataResDto.LoanProductResDto loanProduct : loanProducts) {
			totalLoanBalance += loanProduct.loanBalance();
			totalRemainingLoanBalance += loanProduct.remainingLoanBalance();
			totalAnnualPrincipalAndInterestRepayment += loanProduct.annualPrincipalAndInterestRepayment();
		}

		return new MyDataResDto(
			userId,
			ratingName,
			totalLoanBalance,
			totalRemainingLoanBalance,
			totalAnnualPrincipalAndInterestRepayment,
			loanProducts
		);
	}
}
