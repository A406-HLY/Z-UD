package com.zud.backend.domain.document.dto.request;

import java.util.List;

import com.zud.backend.domain.document.dto.request.deserializer.DocumentExtractionReqDtoDeserializer;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import tools.jackson.databind.annotation.JsonDeserialize;

@Builder
@JsonDeserialize(using = DocumentExtractionReqDtoDeserializer.class)
public record DocumentExtractionReqDto(
	String schemaVersion,
	String consultationId,
	String processStartedAt,
	String processFinishedAt,
	@NotNull
	List<DocumentDto> documents
) {
}
