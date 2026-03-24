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
		String uuid = request.uuid().toString();

		reportRedisRepository.save(
			LoanReportResultCache.requested(uuid, userId, LocalDateTime.now())
		);

		LoanReportReqMessage message = reportConverter.toMessage(request);
		reportKafkaProducer.send(uuid, message);

		return reportConverter.toGenerateResponse(uuid);
	}
}
