package com.zud.backend.domain.notification.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.domain.notification.dto.NotificationResDto;

public interface NotificationFacadeService {
	SseEmitter subscribe(final Long consultationId);

	void disconnect(final Long consultationId);

	void send(final Long consultationId, final NotificationResDto notificationResDto);
}