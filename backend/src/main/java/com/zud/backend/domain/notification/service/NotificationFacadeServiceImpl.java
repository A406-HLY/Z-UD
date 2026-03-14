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
	public SseEmitter subscribe(final Long counselId) {
		SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
		emitterRepository.save(counselId, emitter);

		emitter.onCompletion(() -> {
			log.info("[SSE] 연결 완료: counselId={}", counselId);
			emitterRepository.deleteByCounselId(counselId);
		});

		emitter.onTimeout(() -> {
			log.info("[SSE] 연결 타임아웃: counselId={}", counselId);
			emitterRepository.deleteByCounselId(counselId);
		});

		emitter.onError(ex -> {
			log.error("[SSE] 연결 오류: counselId={}, error={}", counselId, ex.getMessage());
			emitterRepository.deleteByCounselId(counselId);
		});

		try {
			emitter.send(SseEmitter.event()
				.name("connect")
				.data("SSE 연결 성공"));
			log.info("[SSE] 연결 성공: counselId={}", counselId);
		} catch (IOException e) {
			log.error("[SSE] 초기 연결 메시지 전송 실패: counselId={}", counselId, e);
			emitterRepository.deleteByCounselId(counselId);
		}

		return emitter;
	}

	@Override
	public void disconnect(final Long counselId) {
		SseEmitter emitter = emitterRepository.findByCounselId(counselId);
		if (emitter != null) {
			emitter.complete();
			log.info("[SSE] 연결 해제: counselId={}", counselId);
		}
	}

	@Override
	public void send(final Long counselId, final NotificationResDto notificationResDto) {
		SseEmitter emitter = emitterRepository.findByCounselId(counselId);
		if (emitter == null) {
			log.warn("[SSE] 연결이 없음: counselId={}", counselId);
			return;
		}

		try {
			emitter.send(SseEmitter.event()
				.name(notificationResDto.eventType())
				.data(notificationResDto));
			log.info("[SSE] 알림 전송 성공: counselId={}, eventType={}", counselId,
				notificationResDto.eventType());
		} catch (IOException e) {
			log.error("[SSE] 알림 전송 실패: counselId={}", counselId, e);
			emitterRepository.deleteByCounselId(counselId);
		}
	}
}