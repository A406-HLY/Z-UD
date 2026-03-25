package com.zud.backend.domain.document.service.notification;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.zud.backend.domain.document.enums.OcrEventType;
import com.zud.backend.domain.notification.dto.NotificationResDto;
import com.zud.backend.domain.notification.service.NotificationFacadeService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class OcrNotificationService {

	private final NotificationFacadeService notificationFacadeService;

	public void notifyOcrCompleted(final Long userId, final String consultationId) {
		send(userId, OcrEventType.OCR_COMPLETED, Map.of("consultationId", consultationId));
	}

	public void notifyOcrFailed(final Long userId, final String consultationId) {
		send(userId, OcrEventType.OCR_FAILED, Map.of("consultationId", consultationId));
	}

	private void send(final Long userId, final OcrEventType eventType, final Object data) {
		try {
			notificationFacadeService.send(
				userId,
				new NotificationResDto(eventType.name(), eventType.defaultMessage(), data)
			);
		} catch (Exception ex) {
			log.warn("[OcrSSE] 알림 전송 실패: userId={}, eventType={}, error={}",
				userId, eventType.name(), ex.getMessage());
		}
	}
}
