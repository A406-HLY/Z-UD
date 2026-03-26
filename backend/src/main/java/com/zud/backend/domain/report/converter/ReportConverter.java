package com.zud.backend.domain.report.converter;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import com.zud.backend.domain.report.dto.message.LoanReportReqMessage;
import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateResDto;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;
import com.zud.backend.domain.report.redis.LoanReportResultCache;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReportConverter {

	private static final String REPORT_REQUEST_ACCEPTED_MESSAGE = "리포트 생성 요청이 접수되었습니다.";
	private final ObjectMapper objectMapper;

	public LoanReportReqMessage toMessage(LoanReportReqDto request) {
		return new LoanReportReqMessage(
			LocalDateTime.now(),
			request
		);
	}

	public LoanReportGenerateResDto toGenerateResponse(String consultationId) {
		return new LoanReportGenerateResDto(
			consultationId,
			REPORT_REQUEST_ACCEPTED_MESSAGE
		);
	}

	public LoanReportResultResDto toResultResponse(LoanReportResultCache cache) {
		if (cache.payload() == null) {
			return new LoanReportResultResDto(
				cache.consultationId(),
				cache.status().name(),
				null
			);
		}

		JsonNode root;
		try {
			root = objectMapper.readTree(cache.payload());
		} catch (Exception e) {
			throw new IllegalStateException("리포트 payload 파싱 실패", e);
		}

		JsonNode resultNode = root.path("result").isMissingNode() || root.path("result").isNull()
			? root
			: root.path("result");

		Map<String, Object> result = objectMapper.convertValue(
			resultNode,
			new TypeReference<Map<String, Object>>() {
			}
		);

		return new LoanReportResultResDto(
			cache.consultationId(),
			cache.status().name(),
			result
		);
	}

}
