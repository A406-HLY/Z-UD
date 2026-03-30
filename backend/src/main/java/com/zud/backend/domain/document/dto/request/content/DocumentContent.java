package com.zud.backend.domain.document.dto.request.content;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

public interface DocumentContent {

	@JsonIgnore
	DocumentTag getDocumentTag();

	@JsonIgnore
	default Map<CrossField, String> getCrossCheckFields() {
		return Map.of();
	}
}
