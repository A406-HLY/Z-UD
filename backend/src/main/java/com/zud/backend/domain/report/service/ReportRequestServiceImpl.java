package com.zud.backend.domain.report.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.domain.report.converter.ReportConverter;
import com.zud.backend.domain.report.dto.message.LoanReportReqMessage;
import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateRes;
import com.zud.backend.domain.report.redis.LoanReportResultCache;
import com.zud.backend.domain.report.repository.ReportRedisRepository;
import com.zud.backend.domain.report.service.kafka.ReportKafkaProducer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportRequestServiceImpl implements ReportRequestService {

	private final ReportConverter reportConverter;
	private final ReportRedisRepository reportRedisRepository;
	private final ReportKafkaProducer reportKafkaProducer;

	@Override
	@Transactional
	public LoanReportGenerateRes requestReport(Long userId, LoanReportReqDto request) {
		String counselId = request.counselId().toString();
		log.info("[Report] 리포트 생성 요청 수신: userId={}, counselId={}", userId, counselId);

		reportRedisRepository.save(
			LoanReportResultCache.requested(counselId, userId, LocalDateTime.now())
		);

		LoanReportReqMessage message = reportConverter.toMessage(request);
		reportKafkaProducer.send(counselId, message);
		log.info("[Report] Kafka 요청 전송 완료: topic=report-request, counselId={}", counselId);

		return reportConverter.toGenerateResponse(counselId);
	}
}
