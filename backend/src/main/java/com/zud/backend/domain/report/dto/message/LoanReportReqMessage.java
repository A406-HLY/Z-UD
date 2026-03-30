package com.zud.backend.domain.report.dto.message;

import java.time.LocalDateTime;
import java.util.UUID;

import com.zud.backend.domain.report.dto.request.LoanReportReqDto;

public record LoanReportReqMessage(
	UUID consultationId,
	LocalDateTime requestedAt,
	LoanReportReqDto payload
) {
}
