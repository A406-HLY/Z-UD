package com.zud.backend.domain.document.service.kafka;

import static com.zud.backend.common.kafka.KafkaTopics.*;

import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.KafkaListener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.consultation.service.query.ConsultationQueryService;
import com.zud.backend.domain.document.dto.request.DocumentExtractionReqDto;
import com.zud.backend.domain.document.dto.response.DocumentExtractionResDto;
import com.zud.backend.domain.document.exception.DocumentException;
import com.zud.backend.domain.document.redis.OcrExtractionResultCache;
import com.zud.backend.domain.document.repository.OcrResultRedisRepository;
import com.zud.backend.domain.document.service.facade.DocumentFacadeService;
import com.zud.backend.domain.document.service.notification.OcrNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class OcrKafkaConsumer {

	private final ObjectMapper objectMapper;
	private final ConsultationQueryService consultationQueryService;
	private final DocumentFacadeService documentFacadeService;
	private final OcrResultRedisRepository ocrResultRedisRepository;
	private final OcrNotificationService ocrNotificationService;

	@KafkaListener(
		topics = OCR_RESPONSE,
		containerFactory = "ocrKafkaListenerContainerFactory"
	)
	public void consume(final String messageBody) {
		try {
			DocumentExtractionReqDto reqDto = objectMapper.readValue(messageBody, DocumentExtractionReqDto.class);
			DocumentExtractionResDto result = documentFacadeService.validateDocuments(reqDto);
			ocrResultRedisRepository.save(OcrExtractionResultCache.of(reqDto.consultationId(), result));
			Long userId = consultationQueryService.findByUuid(reqDto.consultationId()).getUserId();
			ocrNotificationService.notifyOcrCompleted(userId, reqDto.consultationId());
		} catch (DocumentException e) {
			log.error("[OCR] Kafka 응답 처리 실패", e);
			throw e;
		} catch (JsonProcessingException e) {
			log.error("[OCR] Kafka 응답 역직렬화 실패", e);
			throw new DocumentException(ErrorCode.DESERIALIZE_ERROR);
		} catch (Exception e) {
			log.error("[OCR] Kafka 응답 처리 중 예외 발생", e);
			throw new DocumentException(ErrorCode.INTERNAL_SERVER_ERROR);
		}
	}
}
