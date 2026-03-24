package com.zud.backend.domain.report.dto.message;

import java.time.LocalDateTime;

import com.zud.backend.domain.report.dto.request.LoanReportReqDto;

public record LoanReportReqMessage(
	String uuid,
	LocalDateTime requestedAt,
	LoanReportReqDto payload
) {
}
