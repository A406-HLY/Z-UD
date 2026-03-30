package com.zud.backend.domain.document.service.query;

import com.zud.backend.domain.document.dto.response.DocumentExtractionResDto;

public interface DocumentExtractionQueryService {

	DocumentExtractionResDto getExtractionResult(String consultationId);
}
