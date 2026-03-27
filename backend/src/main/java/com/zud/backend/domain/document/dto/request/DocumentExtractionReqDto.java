package com.zud.backend.domain.document.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record DocumentExtractionReqDto(
	String schemaVersion,
	String consultationId,
	ProcessedAt processedAt,
	@NotNull
	List<DocumentDto> documents
) {
	public record ProcessedAt(
		String startedAt,
		String finishedAt
	) {
	}
}
