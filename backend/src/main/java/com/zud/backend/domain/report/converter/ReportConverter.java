package com.zud.backend.domain.report.converter;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.zud.backend.domain.report.dto.message.LoanReportReqMessage;
import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateRes;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;
import com.zud.backend.domain.report.redis.LoanReportResultCache;

@Component
public class ReportConverter {

	private static final String REPORT_REQUEST_ACCEPTED_MESSAGE = "리포트 생성 요청이 접수되었습니다.";

	public LoanReportReqMessage toMessage(LoanReportReqDto request) {
		return new LoanReportReqMessage(
			LocalDateTime.now(),
			request
		);
	}

	public LoanReportGenerateRes toGenerateResponse(String counselId) {
		return new LoanReportGenerateRes(
			counselId,
			REPORT_REQUEST_ACCEPTED_MESSAGE
		);
	}

	public LoanReportResultResDto toResultResponse(LoanReportResultCache cache) {
		return new LoanReportResultResDto(
			cache.counselId(),
			cache.status().name(),
			cache.payload()
		);
	}

}
