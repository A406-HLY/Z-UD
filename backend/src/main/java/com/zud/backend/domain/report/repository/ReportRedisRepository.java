package com.zud.backend.domain.report.repository;

import java.util.Optional;

import com.zud.backend.domain.report.redis.LoanReportResultCache;

public interface ReportRedisRepository {
	void save(LoanReportResultCache cache);
	Optional<LoanReportResultCache> findByUuid(String uuid);
}
