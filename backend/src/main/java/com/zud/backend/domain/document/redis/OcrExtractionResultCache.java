package com.zud.backend.domain.document.redis;

import java.io.Serializable;

import com.zud.backend.domain.document.dto.response.DocumentExtractionResDto;

public record OcrExtractionResultCache(
	String consultationId,
	DocumentExtractionResDto result
) implements Serializable {

	public static OcrExtractionResultCache of(final String consultationId, final DocumentExtractionResDto result) {
		return new OcrExtractionResultCache(consultationId, result);
	}
}
