package com.zud.backend.domain.consultation.service;

import java.time.Duration;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.zud.backend.domain.consultation.enums.CounselStatus;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ConsultationStatusServiceImpl implements ConsultationStatusService {

	private static final String STATUS_KEY_PREFIX = "counsel:status:";
	private static final String DATA_KEY_PREFIX = "counsel:data:";
	private static final Duration TTL = Duration.ofHours(2);

	private final RedisTemplate<String, List<String>> documentVerificationRedisTemplate;
	private final RedisTemplate<String, String> stringRedisTemplate;

	@Override
	public void updateDocumentVerificationStatus(String dirName, CounselStatus status, List<String> uploadedUrls) {
		String statusKey = STATUS_KEY_PREFIX + dirName;
		stringRedisTemplate.opsForValue().set(statusKey, status.name(), TTL);

		if (!CollectionUtils.isEmpty(uploadedUrls)) {
			String dataKey = DATA_KEY_PREFIX + dirName;
			documentVerificationRedisTemplate.opsForValue().set(dataKey, uploadedUrls, TTL);
		}

		log.info("[Counsel] 상태 갱신: dirName={}, status={}", dirName, status);
	}

	@Override
	public void deleteStatus(String dirName) {
		stringRedisTemplate.delete(STATUS_KEY_PREFIX + dirName);
		documentVerificationRedisTemplate.delete(DATA_KEY_PREFIX + dirName);
		log.info("[CounselStatus] 상태 삭제: dirName={}", dirName);
	}
}
