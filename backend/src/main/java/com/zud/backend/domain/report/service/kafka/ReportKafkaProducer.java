package com.zud.backend.domain.report.service.kafka;

import static com.zud.backend.common.kafka.KafkaTopics.*;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.zud.backend.domain.report.dto.message.LoanReportReqMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReportKafkaProducer {

	private final KafkaTemplate<String, Object> kafkaTemplate;

	public void send(String counselId, LoanReportReqMessage message) {
		kafkaTemplate.send(REPORT_REQUEST, counselId, message);
		log.debug("[ReportKafka] 메시지 발행: topic={}, key={}", REPORT_REQUEST, counselId);
	}
}
