package com.zud.backend.domain.document.dto.response;

import java.util.List;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "문서 검증 결과 (DocumentDto 기반)")
public record DocumentValidationResult(
	@ArraySchema(schema = @Schema(implementation = DocumentMissing.class),
		arraySchema = @Schema(description = "누락된 문서 목록(없으면 빈 배열)"))
	List<DocumentMissing> documentMissings,

	@ArraySchema(schema = @Schema(implementation = DocumentViolation.class),
		arraySchema = @Schema(description = "필수 항목 불일치 문서 목록(없으면 빈 배열)"))
	List<DocumentViolation> violations,

	@ArraySchema(schema = @Schema(implementation = DocumentRisk.class),
		arraySchema = @Schema(description = "리스크 감지 목록(없으면 빈 배열)"))
	List<DocumentRisk> risks
) {
}
