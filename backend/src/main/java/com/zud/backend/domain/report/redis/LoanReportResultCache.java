package com.zud.backend.domain.report.redis;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.zud.backend.domain.report.enums.LoanReportStatus;

public record LoanReportResultCache(
	String uuid,
	Long userId,
	LoanReportStatus status,
	String payload,
	LocalDateTime requestedAt,
	LocalDateTime completedAt
) implements Serializable {

	public static LoanReportResultCache requested(String uuid, Long userId, LocalDateTime requestedAt) {
		return new LoanReportResultCache(
			uuid,
			userId,
			LoanReportStatus.REQUESTED,
			null,
			requestedAt,
			null
		);
	}

	public LoanReportResultCache completed(String payload, LocalDateTime completedAt) {
		return new LoanReportResultCache(
			this.uuid,
			this.userId,
			LoanReportStatus.COMPLETED,
			payload,
			this.requestedAt,
			completedAt
		);
	}

	public LoanReportResultCache failed(LocalDateTime completedAt) {
		return new LoanReportResultCache(
			this.uuid,
			this.userId,
			LoanReportStatus.FAILED,
			this.payload,
			this.requestedAt,
			completedAt
		);
	}
}
