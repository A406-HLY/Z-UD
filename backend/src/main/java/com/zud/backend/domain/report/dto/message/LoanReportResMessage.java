package com.zud.backend.domain.report.dto.message;

import java.time.LocalDateTime;

public record LoanReportResMessage(
	LocalDateTime completedAt,
	ReportResponsePayload payload
) {
	public record ReportResponsePayload(
		// TODO: report output 필드 확정 후 정의
	) {
	}
}
