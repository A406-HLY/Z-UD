package com.zud.backend.domain.report.redis;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.zud.backend.domain.report.enums.LoanReportStatus;

public record LoanReportResultCache(
	String counselId,
	Long userId,
	LoanReportStatus status,
	String payload,
	LocalDateTime requestedAt,
	LocalDateTime completedAt
) implements Serializable {

	public static LoanReportResultCache requested(String counselId, Long userId, LocalDateTime requestedAt) {
		return new LoanReportResultCache(
			counselId,
			userId,
			LoanReportStatus.REQUESTED,
			null,
			requestedAt,
			null
		);
	}

	public LoanReportResultCache completed(String payload, LocalDateTime completedAt) {
		return new LoanReportResultCache(
			this.counselId,
			this.userId,
			LoanReportStatus.COMPLETED,
			payload,
			this.requestedAt,
			completedAt
		);
	}

	public LoanReportResultCache failed(LocalDateTime completedAt) {
		return new LoanReportResultCache(
			this.counselId,
			this.userId,
			LoanReportStatus.FAILED,
			this.payload,
			this.requestedAt,
			completedAt
		);
	}
}
