package com.zud.backend.domain.report.dto.message;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.JsonNode;

public record LoanReportResMessage(
	String consultationId,
	LocalDateTime completedAt,
	JsonNode result
) {
}
