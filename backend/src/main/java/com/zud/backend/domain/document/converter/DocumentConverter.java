package com.zud.backend.domain.document.converter;

import java.util.List;

import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.response.DocumentExtractionDesDto;
import com.zud.backend.domain.document.dto.response.DocumentMissing;
import com.zud.backend.domain.document.dto.response.DocumentRisk;
import com.zud.backend.domain.document.dto.response.DocumentValidationResult;
import com.zud.backend.domain.document.dto.response.DocumentViolation;
import com.zud.backend.domain.document.enums.DocumentTag;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DocumentConverter {
	public DocumentViolation toDocumentViolation(final DocumentTag documentTag, final List<String> fields) {
		return DocumentViolation.builder()
			.documentType(documentTag.getDocumentType())
			.documentTypeLabel(documentTag.getLabel())
			.fields(fields)
			.build();
	}

	public DocumentMissing toDocumentMissingDocument(final DocumentTag documentTag) {
		return DocumentMissing.builder()
			.documentType(documentTag.getDocumentType())
			.documentTypeLabel(documentTag.getLabel())
			.build();
	}

	public DocumentRisk toDocumentRisk(final DocumentTag documentTag, final List<String> fields) {
		return DocumentRisk.builder()
			.documentType(documentTag.getDocumentType())
			.documentTypeLabel(documentTag.getLabel())
			.fields(fields)
			.build();
	}

	public DocumentExtractionDesDto toDocumentExtractionDesDto(
		final DocumentValidationResult validationResult,
		final List<DocumentDto> documents
	) {
		return DocumentExtractionDesDto.builder()
			.documents(documents)
			.validationResult(validationResult)
			.build();
	}
}
