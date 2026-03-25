package com.zud.backend.domain.document.dto.request;

import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zud.backend.domain.document.dto.request.content.DocumentContent;
import com.zud.backend.domain.document.dto.request.deserializer.DocumentDtoDeserializer;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
@JsonDeserialize(using = DocumentDtoDeserializer.class)
public record DocumentDto(
	String fileId,
	String storageType,
	String bucket,
	String fileKey,
	String fileName,
	String fileUrl,
	String mimeType,
	String status,
	String errorCode,
	String errorMessage,
	@Valid @NotNull DocumentClassification documentClassification,
	@Valid ExtractionDetail extraction,
	List<ReviewItem> reviewItems,
	String rawText,
	List<PageInfo> pages
) {
	@Builder
	public record DocumentClassification(
		String documentGroup,
		String documentType,
		String documentTypeLabel,
		Double classificationConfidence,
		String classificationModel
	) {
	}

	@Builder
	public record ExtractionDetail(
		String model,
		DocumentContent content
	) {
	}

	@Builder
	public record ReviewItem(
		String reviewCode,
		String reviewMessage
	) {
	}

	@Builder
	public record PageInfo(
		Integer pageNum
	) {
	}
}
