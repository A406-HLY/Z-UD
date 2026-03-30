package com.zud.backend.domain.notification.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.domain.notification.dto.NotificationResDto;
import com.zud.backend.domain.notification.dto.request.TestNotificationReqDto;

public interface NotificationFacadeService {
	SseEmitter subscribe(final String accessToken);

	void disconnect(final Long userId);

	void send(final Long userId, final NotificationResDto notificationResDto);

	void sendTestNotification(final Long requesterUserId, final TestNotificationReqDto reqDto);
}