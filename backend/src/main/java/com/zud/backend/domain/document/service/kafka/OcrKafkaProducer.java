package com.zud.backend.domain.document.service.kafka;

import static com.zud.backend.common.kafka.KafkaTopics.*;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.zud.backend.domain.document.dto.message.OcrReqMessage;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OcrKafkaProducer {

	private final KafkaTemplate<String, Object> kafkaTemplate;

	public void sendRequest(final String consultationId, final OcrReqMessage message) {
		kafkaTemplate.send(OCR_REQUEST, consultationId, message);
	}
}
