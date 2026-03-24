package com.zud.backend.domain.document.service.query;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.document.dto.response.DocumentExtractionResDto;
import com.zud.backend.domain.document.exception.DocumentException;
import com.zud.backend.domain.document.redis.OcrExtractionResultCache;
import com.zud.backend.domain.document.repository.OcrResultRedisRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class DocumentExtractionQueryServiceImpl implements DocumentExtractionQueryService {

	private final OcrResultRedisRepository ocrResultRedisRepository;

	@Override
	public DocumentExtractionResDto getExtractionResult(final String consultationId) {
		return ocrResultRedisRepository.findByConsultationId(consultationId)
			.map(OcrExtractionResultCache::result)
			.orElseThrow(() -> new DocumentException(ErrorCode.NOT_FOUND));
	}
}
