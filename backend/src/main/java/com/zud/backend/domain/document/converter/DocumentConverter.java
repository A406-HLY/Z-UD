package com.zud.backend.domain.document.converter;

import java.util.List;

import com.zud.backend.domain.consultation.enums.CounselStatus;
import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.response.DocumentExtractionDesDto;
import com.zud.backend.domain.document.dto.response.DocumentMissing;
import com.zud.backend.domain.document.dto.response.DocumentValidationResult;
import com.zud.backend.domain.document.dto.response.DocumentViolation;
import com.zud.backend.domain.document.dto.response.file.PresignedFileDto;
import com.zud.backend.domain.document.dto.response.file.PresignedUrlResDto;
import com.zud.backend.domain.document.dto.response.file.UploadCompletionResDto;
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

	public DocumentExtractionDesDto toDocumentExtractionDesDto(
		final DocumentValidationResult validationResult,
		final List<DocumentDto> documents
	) {
		return DocumentExtractionDesDto.builder()
			.documents(documents)
			.validationResult(validationResult)
			.build();
	}

	public PresignedFileDto toPresignedFileDto(
		final String fileName, final String presignedUrl, final int expiresIn
	) {
		return PresignedFileDto.builder()
			.fileName(fileName)
			.presignedUrl(presignedUrl)
			.expiresIn(expiresIn)
			.build();
	}

	public PresignedUrlResDto toPresignedUrlResDto(final List<PresignedFileDto> files) {
		return PresignedUrlResDto.builder()
			.files(files)
			.build();
	}

	public UploadCompletionResDto toUploadCompletionResDto(
		final String consultationId,
		final CounselStatus status,
		final int successCount,
		final List<String> failedFiles
	) {
		return UploadCompletionResDto.builder()
			.consultationId(consultationId)
			.status(status.toString())
			.successCount(successCount)
			.failedFiles(failedFiles)
			.build();
	}
}
