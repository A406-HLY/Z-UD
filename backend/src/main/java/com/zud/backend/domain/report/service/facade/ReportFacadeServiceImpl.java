package com.zud.backend.domain.report.service.facade;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateResDto;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;
import com.zud.backend.domain.report.service.ReportRequestService;
import com.zud.backend.domain.report.service.query.ReportQueryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class ReportFacadeServiceImpl implements ReportFacadeService {

	private final ReportRequestService reportRequestService;
	private final ReportQueryService reportQueryService;

	@Override
	@Transactional
	public LoanReportGenerateResDto generateLoanReport(Long userId, LoanReportReqDto request) {
		return reportRequestService.requestReport(userId, request);
	}

	@Override
	public LoanReportResultResDto getReportResult(String consultationId) {
		return reportQueryService.getReportResult(consultationId);
	}
}
