package com.zud.backend.domain.document.dto.response;

import java.util.List;

import com.zud.backend.domain.document.dto.request.DocumentDto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
@Schema(description = "문서 추출/검증 응답 데이터 (DocumentDto 재사용)")
public record DocumentExtractionResDto(
	@NotNull
	@Schema(description = "OCR 추출 문서 목록 (DocumentDto)")
	List<DocumentDto> documents,

	@Schema(description = "문서 검증 결과")
	DocumentValidationResult validationResult
) {
}
