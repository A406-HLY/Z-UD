package com.zud.backend.domain.document.repository;

import java.util.Optional;

import com.zud.backend.domain.document.redis.OcrExtractionResultCache;

public interface OcrResultRedisRepository {

	void save(OcrExtractionResultCache cache);

	Optional<OcrExtractionResultCache> findByConsultationId(String consultationId);
}
