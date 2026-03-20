package com.zud.backend.domain.document.dto.request.request;

import java.util.List;

import com.zud.backend.domain.document.dto.request.DocumentDto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record DocumentExtractionReqDto(
	String schemaVersion,
	String jobId,
	String caseId,
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
