package com.zud.backend.domain.report.repository;

import java.time.Duration;
import java.util.Optional;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import com.zud.backend.domain.report.redis.LoanReportResultCache;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ReportRedisRepositoryImpl implements ReportRedisRepository {

	private static final String KEY_PREFIX = "loan-report:";
	private static final Duration TTL = Duration.ofHours(24);

	private final RedisTemplate<String, LoanReportResultCache> loanReportRedisTemplate;

	@Override
	public void save(LoanReportResultCache cache) {
		loanReportRedisTemplate.opsForValue().set(
			KEY_PREFIX + cache.consultationId(),
			cache,
			TTL
		);
	}

	@Override
	public Optional<LoanReportResultCache> findByConsultationId(String consultationId) {
		return Optional.ofNullable(
			loanReportRedisTemplate.opsForValue().get(KEY_PREFIX + consultationId)
		);
	}
}
