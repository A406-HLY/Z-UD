package com.zud.backend.domain.notification.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.domain.notification.dto.NotificationResDto;

public interface NotificationFacadeService {
	SseEmitter subscribe(final Long userId);

	void disconnect(final Long userId);

	void send(final Long userId, final NotificationResDto notificationResDto);
}