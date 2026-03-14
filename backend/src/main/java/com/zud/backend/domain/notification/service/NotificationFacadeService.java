package com.zud.backend.domain.notification.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.domain.notification.dto.NotificationResDto;

public interface NotificationFacadeService {
	SseEmitter subscribe(final Long counselId);

	void disconnect(final Long counselId);

	void send(final Long counselId, final NotificationResDto notificationResDto);
}