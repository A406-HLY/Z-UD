package com.zud.backend.domain.report.service.kafka;

import static com.zud.backend.common.kafka.KafkaTopics.*;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.zud.backend.domain.report.dto.message.LoanReportReqMessage;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReportKafkaProducer {

	private final KafkaTemplate<String, Object> kafkaTemplate;

	public void send(String uuid, LoanReportReqMessage message) {
		kafkaTemplate.send(REPORT_REQUEST, uuid, message);
	}
}
