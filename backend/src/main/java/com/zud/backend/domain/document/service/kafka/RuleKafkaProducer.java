package com.zud.backend.domain.document.service.kafka;

import static com.zud.backend.common.kafka.KafkaTopics.*;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.zud.backend.domain.document.dto.message.RuleUpdateMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RuleKafkaProducer {

	private final KafkaTemplate<String, Object> kafkaTemplate;

	public void send(final RuleUpdateMessage message) {
		kafkaTemplate.send(RULES_UPDATE, message);
		log.info("[RuleKafka] 규칙 업데이트 메시지 발행: topic={}, urlCount={}",
			RULES_UPDATE, message.presignedUrls().size());
	}
}
