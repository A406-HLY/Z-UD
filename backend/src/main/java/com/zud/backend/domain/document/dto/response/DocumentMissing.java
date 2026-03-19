package com.zud.backend.domain.document.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "누락된 문서 정보 (DocumentDto.documentClassification 기준)")
public record DocumentMissing(
	@Schema(description = "문서 타입 코드 (DocumentDto.documentClassification.documentType)",
		example = "NATIONAL_TAX_CERTIFICATE")
	String documentType,

	@Schema(description = "문서 타입 한글명 (DocumentDto.documentClassification.documentTypeLabel)",
		example = "납세증명서(국세완납증명)")
	String documentTypeLabel
) {
}
