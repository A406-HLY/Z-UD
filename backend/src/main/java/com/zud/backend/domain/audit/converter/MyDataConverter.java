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

		for (MyDataResDto.LoanProductResDto loanProduct : loanProducts) {
			totalLoanBalance += parseAmount(loanProduct.loanBalance());
			totalRemainingLoanBalance += parseAmount(loanProduct.remainingLoanBalance());
		}

		return new MyDataResDto(
			userId,
			ratingName,
			String.valueOf(totalLoanBalance),
			String.valueOf(totalRemainingLoanBalance),
			loanProducts
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
