package com.zud.backend.domain.report.service.query;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.report.converter.ReportConverter;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;
import com.zud.backend.domain.report.exception.ReportException;
import com.zud.backend.domain.report.redis.LoanReportResultCache;
import com.zud.backend.domain.report.repository.ReportRedisRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class ReportQueryServiceImpl implements ReportQueryService {

	private final ReportRedisRepository reportRedisRepository;
	private final ReportConverter reportConverter;

	@Override
	public LoanReportResultResDto getReportResult(String counselId) {
		log.info("[Report] 리포트 결과 조회 요청: counselId={}", counselId);
		LoanReportResultCache cache = reportRedisRepository.findByCounselId(counselId)
			.orElseThrow(() -> new ReportException(ErrorCode.REPORT_RESULT_NOT_FOUND));

		log.info("[Report] 리포트 결과 조회 성공: counselId={}, status={}", counselId, cache.status());
		return reportConverter.toResultResponse(cache);
	}
}
