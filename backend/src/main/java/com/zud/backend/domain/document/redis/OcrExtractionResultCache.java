package com.zud.backend.domain.document.redis;

import java.io.Serializable;

import com.zud.backend.domain.document.dto.response.DocumentExtractionDesDto;

public record OcrExtractionResultCache(
	String consultationId,
	DocumentExtractionDesDto result
) implements Serializable {

	public static OcrExtractionResultCache of(final String consultationId, final DocumentExtractionDesDto result) {
		return new OcrExtractionResultCache(consultationId, result);
	}
}
