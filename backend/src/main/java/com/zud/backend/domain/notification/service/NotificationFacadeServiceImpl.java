package com.zud.backend.domain.notification.service;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.domain.notification.dto.NotificationResDto;
import com.zud.backend.domain.notification.dto.request.TestNotificationReqDto;
import com.zud.backend.domain.notification.repository.EmitterRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationFacadeServiceImpl implements NotificationFacadeService {

	private static final long DEFAULT_TIMEOUT = Duration.ofHours(1).toMillis();
	private static final String DEFAULT_TEST_EVENT_TYPE = "TEST_NOTIFICATION";
	private static final String DEFAULT_TEST_MESSAGE = "테스트 알림입니다.";

	private final EmitterRepository emitterRepository;
	private final JwtDecoder jwtDecoder;

	@Override
	public SseEmitter subscribe(final String accessToken) {
		Jwt jwt = jwtDecoder.decode(accessToken);
		Long userId = jwt.getClaim("userId");

		SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
		emitterRepository.save(userId, emitter);

		emitter.onCompletion(() -> {
			log.info("[SSE] 연결 완료: userId={}", userId);
			emitterRepository.deleteByUserId(userId);
		});

		emitter.onTimeout(() -> {
			log.info("[SSE] 연결 타임아웃: userId={}", userId);
			emitterRepository.deleteByUserId(userId);
		});

		emitter.onError(ex -> {
			log.error("[SSE] 연결 오류: userId={}, error={}", userId, ex.getMessage());
			emitterRepository.deleteByUserId(userId);
		});

		try {
			emitter.send(SseEmitter.event()
				.name("connect")
				.data("SSE 연결 성공"));
			log.info("[SSE] 연결 성공: userId={}", userId);
		} catch (IOException e) {
			log.error("[SSE] 초기 연결 메시지 전송 실패: userId={}", userId, e);
			emitterRepository.deleteByUserId(userId);
		}

		return emitter;
	}

	@Override
	public void disconnect(final Long userId) {
		SseEmitter emitter = emitterRepository.findByUserId(userId);
		if (emitter != null) {
			emitter.complete();
			log.info("[SSE] 연결 해제: userId={}", userId);
		}
	}

	@Override
	public void send(final Long userId, final NotificationResDto notificationResDto) {
		SseEmitter emitter = emitterRepository.findByUserId(userId);
		if (emitter == null) {
			log.warn("[SSE] 연결이 없음: userId={}", userId);
			return;
		}

		try {
			emitter.send(SseEmitter.event()
				.name(notificationResDto.eventType())
				.data(notificationResDto));
			log.info(
				"[SSE] 알림 전송 성공: userId={}, eventType={}",
				userId,
				notificationResDto.eventType());
		} catch (IOException e) {
			log.error("[SSE] 알림 전송 실패: userId={}", userId, e);
			emitterRepository.deleteByUserId(userId);
		}
	}

	@Override
	public void sendTestNotification(final Long requesterUserId, final TestNotificationReqDto reqDto) {
		Long targetUserId = reqDto.targetUserId() == null ? requesterUserId : reqDto.targetUserId();
		String eventType = StringUtils.hasText(reqDto.eventType()) ? reqDto.eventType() : DEFAULT_TEST_EVENT_TYPE;
		String message = StringUtils.hasText(reqDto.message()) ? reqDto.message() : DEFAULT_TEST_MESSAGE;
		Object data = reqDto.data() == null ? createDefaultTestData(requesterUserId, targetUserId) : reqDto.data();

		send(targetUserId, new NotificationResDto(eventType, message, data));
	}

	private Map<String, Object> createDefaultTestData(final Long requesterUserId, final Long targetUserId) {
		Map<String, Object> data = new HashMap<>();
		data.put("requesterUserId", requesterUserId);
		data.put("targetUserId", targetUserId);
		data.put("source", "notification-test-api");
		return data;
	}
}
