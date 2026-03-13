package com.zud.backend.domain.notification.repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Repository
public class EmitterRepository {

	private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

	public SseEmitter findByCounselId(final Long counselId) {
		return emitters.get(counselId);
	}

	public void save(Long counselId, final SseEmitter sseEmitter) {
		emitters.put(counselId, sseEmitter);
	}

	public void deleteByCounselId(Long counselId) {
		emitters.remove(counselId);
	}
}