package com.zud.backend.domain.notification.repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Repository
public class EmitterRepository {

	private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

	public SseEmitter findByConsultationId(final Long consultationId) {
		return emitters.get(consultationId);
	}

	public void save(Long consultationId, final SseEmitter sseEmitter) {
		emitters.put(consultationId, sseEmitter);
	}

	public void deleteByConsultationId(Long consultationId) {
		emitters.remove(consultationId);
	}
}