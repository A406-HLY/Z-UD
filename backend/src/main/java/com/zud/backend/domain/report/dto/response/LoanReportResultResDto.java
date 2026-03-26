package com.zud.backend.domain.report.dto.response;

import java.util.Map;

public record LoanReportResultResDto(
	String consultationId,
	String status,
	Map<String, Object> result
) {
}
