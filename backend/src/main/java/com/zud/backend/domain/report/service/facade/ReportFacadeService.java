package com.zud.backend.domain.report.service.facade;

import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateRes;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;

public interface ReportFacadeService {
	LoanReportGenerateRes generateLoanReport(Long userId, LoanReportReqDto request);

	LoanReportResultResDto getReportResult(String uuid);
}
