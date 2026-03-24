package com.zud.backend.domain.report.service;

import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateRes;

public interface ReportRequestService {
	LoanReportGenerateRes requestReport(LoanReportReqDto request);
}
