package com.zud.backend.domain.report.service;

import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateResDto;

public interface ReportRequestService {
	LoanReportGenerateResDto requestReport(Long userId, LoanReportReqDto request);
}
