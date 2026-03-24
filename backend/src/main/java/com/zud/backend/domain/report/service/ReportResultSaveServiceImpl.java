package com.zud.backend.domain.report.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.report.dto.message.LoanReportResMessage;
import com.zud.backend.domain.report.exception.ReportException;
import com.zud.backend.domain.report.redis.LoanReportResultCache;
import com.zud.backend.domain.report.repository.ReportRedisRepository;
import com.zud.backend.domain.report.service.notification.ReportNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportResultSaveServiceImpl implements ReportResultSaveService {

	private final ReportRedisRepository reportRedisRepository;
	private final ObjectMapper objectMapper;
	private final ReportNotificationService reportNotificationService;

	@Override
	@Transactional
	public void saveReportResult(String messageBody) {
		try {
			log.info("[Report] Kafka 응답 처리 시작");
			JsonNode root = objectMapper.readTree(messageBody);

			// TODO: AI 응답 payload 구조 확정 후 counselId 경로 수정
			JsonNode counselIdNode = root.path("payload").path("counselId");
			if (counselIdNode.isMissingNode() || counselIdNode.isNull()) {
				counselIdNode = root.path("payload").path("uuid");
			}
			if (counselIdNode.isMissingNode() || counselIdNode.isNull()) {
				counselIdNode = root.path("payload").path("UUID");
			}

			if (counselIdNode.isMissingNode() || counselIdNode.isNull()) {
				throw new ReportException(ErrorCode.REPORT_UUID_NOT_FOUND);
			}

			String counselId = counselIdNode.asText();
			log.info("[Report] Kafka 응답 counselId 파싱 완료: counselId={}", counselId);

			LoanReportResMessage message = objectMapper.readValue(messageBody, LoanReportResMessage.class);

			LoanReportResultCache existing = reportRedisRepository.findByCounselId(counselId)
				.orElseThrow(() -> new ReportException(ErrorCode.REPORT_REQUEST_NOT_FOUND));

			reportRedisRepository.save(
				existing.completed(messageBody, message.completedAt())
			);
			reportNotificationService.notifyReportCompleted(existing.userId(), counselId);
			log.info("[Report] 리포트 결과 저장/알림 완료: userId={}, counselId={}", existing.userId(), counselId);
		} catch (ReportException ex) {
			log.warn("[Report] 리포트 결과 처리 중 도메인 예외: {}", ex.getErrorCode());
			throw ex;
		} catch (Exception ex) {
			log.error("[Report] 리포트 결과 처리 실패", ex);
			throw new ReportException(ErrorCode.REPORT_RESULT_PROCESSING_FAILED);
		}

	}
}
