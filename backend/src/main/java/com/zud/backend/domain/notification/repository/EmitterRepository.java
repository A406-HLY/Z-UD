package com.zud.backend.domain.notification.repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Repository
public class EmitterRepository {

	private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

	public SseEmitter findByUserId(final Long userId) {
		return emitters.get(userId);
	}

	public void save(Long userId, final SseEmitter sseEmitter) {
		emitters.put(userId, sseEmitter);
	}

	public void deleteByUserId(Long userId) {
		emitters.remove(userId);
	}
}