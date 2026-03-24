package com.zud.backend.domain.report.service.query;

import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;

public interface ReportQueryService {
	LoanReportResultResDto getReportResult(String uuid);
}
