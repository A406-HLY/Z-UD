package com.zud.backend.domain.report.dto.response;

public record LoanReportResultResDto(
	String consultationId,
	String status,
	Object payload // TODO: payload는 AI output 결정되면 수정
) {
}
