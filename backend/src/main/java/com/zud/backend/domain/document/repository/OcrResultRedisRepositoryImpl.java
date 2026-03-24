package com.zud.backend.domain.document.repository;

import java.time.Duration;
import java.util.Optional;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import com.zud.backend.domain.document.redis.OcrExtractionResultCache;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class OcrResultRedisRepositoryImpl implements OcrResultRedisRepository {

	private static final String KEY_PREFIX = "ocr-extraction-result:";
	private static final Duration TTL = Duration.ofHours(2);

	private final RedisTemplate<String, OcrExtractionResultCache> ocrResultRedisTemplate;

	@Override
	public void save(final OcrExtractionResultCache cache) {
		ocrResultRedisTemplate.opsForValue().set(
			KEY_PREFIX + cache.consultationId(),
			cache,
			TTL
		);
	}

	@Override
	public Optional<OcrExtractionResultCache> findByConsultationId(final String consultationId) {
		return Optional.ofNullable(ocrResultRedisTemplate.opsForValue().get(KEY_PREFIX + consultationId));
	}
}
