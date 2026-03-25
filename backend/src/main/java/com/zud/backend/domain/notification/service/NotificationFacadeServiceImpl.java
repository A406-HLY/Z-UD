package com.zud.backend.domain.notification.service;

import java.io.IOException;
import java.time.Duration;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.domain.notification.dto.NotificationResDto;
import com.zud.backend.domain.notification.repository.EmitterRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationFacadeServiceImpl implements NotificationFacadeService {

	private static final long DEFAULT_TIMEOUT = Duration.ofHours(1).toMillis();

	private final EmitterRepository emitterRepository;

	@Override
	public SseEmitter subscribe(final Long consultationId) {
		SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
		emitterRepository.save(consultationId, emitter);

		emitter.onCompletion(() -> {
			log.info("[SSE] 연결 완료: consultationId={}", consultationId);
			emitterRepository.deleteByConsultationId(consultationId);
		});

		emitter.onTimeout(() -> {
			log.info("[SSE] 연결 타임아웃: consultationId={}", consultationId);
			emitterRepository.deleteByConsultationId(consultationId);
		});

		emitter.onError(ex -> {
			log.error("[SSE] 연결 오류: consultationId={}, error={}", consultationId, ex.getMessage());
			emitterRepository.deleteByConsultationId(consultationId);
		});

		try {
			emitter.send(SseEmitter.event()
				.name("connect")
				.data("SSE 연결 성공"));
			log.info("[SSE] 연결 성공: consultationId={}", consultationId);
		} catch (IOException e) {
			log.error("[SSE] 초기 연결 메시지 전송 실패: consultationId={}", consultationId, e);
			emitterRepository.deleteByConsultationId(consultationId);
		}

		return emitter;
	}

	@Override
	public void disconnect(final Long consultationId) {
		SseEmitter emitter = emitterRepository.findByConsultationId(consultationId);
		if (emitter != null) {
			emitter.complete();
			log.info("[SSE] 연결 해제: consultationId={}", consultationId);
		}
	}

	@Override
	public void send(final Long consultationId, final NotificationResDto notificationResDto) {
		SseEmitter emitter = emitterRepository.findByConsultationId(consultationId);
		if (emitter == null) {
			log.warn("[SSE] 연결이 없음: consultationId={}", consultationId);
			return;
		}

		try {
			emitter.send(SseEmitter.event()
				.name(notificationResDto.eventType())
				.data(notificationResDto));
			log.info(
				"[SSE] 알림 전송 성공: consultationId={}, eventType={}",
				consultationId,
				notificationResDto.eventType());
		} catch (IOException e) {
			log.error("[SSE] 알림 전송 실패: consultationId={}", consultationId, e);
			emitterRepository.deleteByConsultationId(consultationId);
		}
	}
}
