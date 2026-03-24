package com.zud.backend.domain.report.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.report.converter.ReportConverter;
import com.zud.backend.domain.report.dto.message.LoanReportResMessage;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;
import com.zud.backend.domain.report.exception.ReportException;
import com.zud.backend.domain.report.redis.LoanReportResultCache;
import com.zud.backend.domain.report.repository.ReportRedisRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportResultSaveServiceImpl implements ReportResultSaveService {

	private final ReportRedisRepository reportRedisRepository;
	private final ReportConverter reportConverter;
	private final ObjectMapper objectMapper;

	@Override
	@Transactional
	public void saveReportResult(String messageBody) {
		try {
			JsonNode root = objectMapper.readTree(messageBody);

			// TODO: AI 응답 payload 구조 확정 후 uuid 경로 수정
			JsonNode uuidNode = root.path("payload").path("uuid");
			if (uuidNode.isMissingNode() || uuidNode.isNull()) {
				uuidNode = root.path("payload").path("UUID");
			}

			if (uuidNode.isMissingNode() || uuidNode.isNull()) {
				throw new ReportException(ErrorCode.REPORT_UUID_NOT_FOUND);
			}

			String uuid = uuidNode.asText();

			LoanReportResMessage message = objectMapper.readValue(messageBody, LoanReportResMessage.class);

			LoanReportResultCache existing = reportRedisRepository.findByUuid(uuid)
				.orElseThrow(() -> new ReportException(ErrorCode.REPORT_REQUEST_NOT_FOUND));

			reportRedisRepository.save(
				existing.completed(messageBody, message.completedAt())
			);
		} catch (ReportException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new ReportException(ErrorCode.REPORT_RESULT_PROCESSING_FAILED);
		}

	}
}
