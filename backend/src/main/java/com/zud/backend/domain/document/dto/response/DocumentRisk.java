package com.zud.backend.domain.document.dto.response;

import java.util.List;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "문서 리스크 감지 정보 (DocumentDto.documentClassification 기준)")
public record DocumentRisk(
	@Schema(description = "문서 타입 코드 (DocumentDto.documentClassification.documentType)",
		example = "HEALTH_INSURANCE_ELIGIBILITY")
	String documentType,

	@Schema(description = "문서 타입 한글명 (DocumentDto.documentClassification.documentTypeLabel)",
		example = "건강보험 자격득실 확인서")
	String documentTypeLabel,

	@ArraySchema(arraySchema = @Schema(description = "리스크가 감지된 문서 필드 목록"),
		schema = @Schema(example = "employeeName"))
	List<String> fields
) {
}
