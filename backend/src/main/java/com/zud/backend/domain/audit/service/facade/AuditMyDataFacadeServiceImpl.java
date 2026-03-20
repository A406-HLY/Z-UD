package com.zud.backend.domain.audit.service.facade;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.audit.client.SsafyMyDataClient;
import com.zud.backend.domain.audit.converter.LoanProductConverter;
import com.zud.backend.domain.audit.converter.MyDataConverter;
import com.zud.backend.domain.audit.dto.external.response.ExternalCreditRatingResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalInquireLoanAccountListResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalInquireRepaymentRecordsResDto;
import com.zud.backend.domain.audit.dto.external.response.ExternalMemberSearchResDto;
import com.zud.backend.domain.audit.dto.request.MyDataReqDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;
import com.zud.backend.domain.audit.exception.AuditException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class AuditMyDataFacadeServiceImpl implements AuditMyDataFacadeService {

	private final SsafyMyDataClient ssafyMyDataClient;

	@Override
	public MyDataResDto getMyData(final MyDataReqDto reqDto) {
		ExternalMemberSearchResDto member = findMemberOrThrow(reqDto.email());
		String ratingName = fetchRatingName(member.userKey());
		List<MyDataResDto.LoanProductResDto> loanProducts = fetchLoanProducts(member.userKey());
		return MyDataConverter.toMyDataResDto(member.userId(), ratingName, loanProducts);
	}

	private ExternalMemberSearchResDto findMemberOrThrow(final String email) {
		ExternalMemberSearchResDto member = ssafyMyDataClient.findMemberByEmail(email);
		if (member == null || member.userKey() == null || member.userKey().isBlank()) {
			throw new AuditException(ErrorCode.USER_NOT_FOUND);
		}
		return member;
	}

	private String fetchRatingName(final String userKey) {
		ExternalCreditRatingResDto creditRating = ssafyMyDataClient.inquireCreditRating(userKey);
		return creditRating != null && creditRating.rec() != null
			? creditRating.rec().ratingName()
			: null;
	}

	private List<MyDataResDto.LoanProductResDto> fetchLoanProducts(final String userKey) {
		ExternalInquireLoanAccountListResDto loanAccountList = ssafyMyDataClient.inquireLoanAccountList(userKey);
		List<MyDataResDto.LoanProductResDto> loanProducts = new ArrayList<>();

		if (loanAccountList == null || loanAccountList.rec() == null) {
			return loanProducts;
		}

		for (ExternalInquireLoanAccountListResDto.Rec account : loanAccountList.rec()) {
			ExternalInquireRepaymentRecordsResDto repaymentRecords = ssafyMyDataClient.inquireRepaymentRecords(
				userKey,
				account.accountNo()
			);
			loanProducts.add(LoanProductConverter.toLoanProductResDto(account, repaymentRecords));
		}
		return loanProducts;
	}
}
