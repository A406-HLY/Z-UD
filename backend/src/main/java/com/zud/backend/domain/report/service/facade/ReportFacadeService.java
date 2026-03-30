package com.zud.backend.domain.report.service.facade;

import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateResDto;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;

public interface ReportFacadeService {
	LoanReportGenerateResDto generateLoanReport(Long userId, LoanReportReqDto request);

	LoanReportResultResDto getReportResult(String consultationId);
}
