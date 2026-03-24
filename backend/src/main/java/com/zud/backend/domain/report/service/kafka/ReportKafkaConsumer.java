package com.zud.backend.domain.report.service.kafka;

import static com.zud.backend.common.kafka.KafkaTopics.*;

import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.KafkaListener;

import com.zud.backend.domain.report.service.ReportResultSaveService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ReportKafkaConsumer {

	private final ReportResultSaveService reportResultSaveService;

	@KafkaListener(
		topics = REPORT_RESPONSE,
		containerFactory = "loanReportKafkaListenerContainerFactory"
	)
	public void consume(String messageBody) {
		log.debug("[ReportKafka] 메시지 수신: topic={}", REPORT_RESPONSE);
		reportResultSaveService.saveReportResult(messageBody);
	}

}
