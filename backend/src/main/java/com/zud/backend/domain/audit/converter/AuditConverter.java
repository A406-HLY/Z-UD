package com.zud.backend.domain.audit.converter;

import java.util.List;

import com.zud.backend.domain.audit.dto.external.response.ExternalInquireLoanAccountListResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalInquireRepaymentRecordsResDto;
import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class AuditConverter {

	public AuditHouseResDto toAuditResDto(
		final boolean illegalBuilding,
		final NearestBranchResDto nearestBranch,
		final boolean supportedHouseType,
		final HousePriceResDto housePrice
	) {
		return AuditHouseResDto.builder()
			.illegalBuilding(illegalBuilding)
			.nearestBranch(nearestBranch)
			.supportedHouseType(supportedHouseType)
			.housePrice(housePrice)
			.build();
	}

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

