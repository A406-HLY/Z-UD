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
		return new MyDataResDto(userId, ratingName, loanProducts);
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

