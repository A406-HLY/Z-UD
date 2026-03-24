package com.zud.backend.domain.document.dto.response;

import java.util.List;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "문서 필수 항목 불일치 정보 (DocumentDto.documentClassification 기준)")
public record DocumentViolation(
	@Schema(description = "문서 타입 코드 (DocumentDto.documentClassification.documentType)",
		example = "LOCAL_TAX_CERTIFICATE")
	String documentType,

	@Schema(description = "문서 타입 한글명 (DocumentDto.documentClassification.documentTypeLabel)",
		example = "지방세 납세증명서")
	String documentTypeLabel,

	@ArraySchema(arraySchema = @Schema(description = "불일치가 발생한 필드 목록"),
		schema = @Schema(example = "issuedDate"))
	List<String> fields
) {
}
