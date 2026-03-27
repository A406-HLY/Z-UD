package com.zud.backend.domain.document.dto.request;

import java.util.List;

import com.zud.backend.domain.document.dto.request.content.DocumentContent;
import com.zud.backend.domain.document.dto.request.deserializer.DocumentDtoDeserializer;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import tools.jackson.databind.annotation.JsonDeserialize;

@Builder
@JsonDeserialize(using = DocumentDtoDeserializer.class)
public record DocumentDto(
	String consultationId,
	String fileId,
	String storageType,
	String bucket,
	String fileKey,
	String fileName,
	String fileUrl,
	String mimeType,
	String processStartedAt,
	String processFinishedAt,
	@Valid @NotNull DocumentClassification documentClassification,
	String documentType,
	String documentTypeLabel,
	List<Integer> pageNums,
	@Valid DocumentContent content,
	String rawText,
	String status,
	String error
) {
	@Builder
	public record DocumentClassification(
		String documentGroup,
		String documentType,
		String documentTypeLabel,
		Double classificationConfidence,
		String classificationStatus,
		String classificationMethod,
		String classificationStrategy,
		Boolean reviewRequired,
		Double scoreGap,
		String titleText,
		String issuerText,
		String documentNumberText,
		List<String> keyClues,
		FallbackClassification fallbackClassification
	) {
	}

	@Builder
	public record FallbackClassification(
		String documentType,
		Double confidence,
		List<String> keyClues,
		Double elapsedSec,
		String rawOutput,
		String classificationCropMode
	) {
	}
}
