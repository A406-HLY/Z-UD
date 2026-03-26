package com.zud.backend.domain.report.dto.message;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

public record LoanReportResMessage(
	String consultationId,
	LocalDateTime completedAt,
	JsonNode result
) {
}
