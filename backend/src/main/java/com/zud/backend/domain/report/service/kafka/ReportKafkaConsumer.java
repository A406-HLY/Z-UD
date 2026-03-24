package com.zud.backend.domain.report.service.kafka;

import static com.zud.backend.common.kafka.KafkaTopics.*;

import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.KafkaListener;

import com.zud.backend.domain.report.service.ReportResultSaveService;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class ReportKafkaConsumer {

	private final ReportResultSaveService reportResultSaveService;

	@KafkaListener(
		topics = REPORT_RESPONSE,
		containerFactory = "loanReportKafkaListenerContainerFactory"
	)
	public void consume(String messageBody) {
		reportResultSaveService.saveReportResult(messageBody);
	}

}
