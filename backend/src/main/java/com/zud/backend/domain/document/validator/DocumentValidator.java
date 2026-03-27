package com.zud.backend.domain.document.validator;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.document.converter.DocumentConverter;
import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.request.content.DocumentContent;
import com.zud.backend.domain.document.dto.response.DocumentMissing;
import com.zud.backend.domain.document.dto.response.DocumentValidationResult;
import com.zud.backend.domain.document.dto.response.DocumentViolation;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

@Component
public class DocumentValidator {

	private final Map<DocumentTag, DocumentContentValidator<?>> validatorMap;

	public DocumentValidator(final List<DocumentContentValidator<?>> validators) {
		this.validatorMap = validators.stream()
			.collect(Collectors.toMap(
				DocumentContentValidator::getSupportedTag,
				Function.identity()
			));
	}

	public DocumentValidationResult validateAll(
		final List<DocumentDto> documents,
		final Consultation consultation
	) {
		List<DocumentMissing> documentMissings = validateRequiredDocuments(documents, consultation);

		List<DocumentViolation> violations = Stream.of(
			validateEach(documents, consultation),
			validateCrossDocuments(documents, consultation)
		).flatMap(List::stream).toList();

		return DocumentValidationResult.builder()
			.documentMissings(documentMissings)
			.violations(violations)
			.build();
	}

	private List<DocumentMissing> validateRequiredDocuments(
		final List<DocumentDto> documents,
		final Consultation consultation
	) {
		Set<DocumentTag> submittedTags = documents.stream()
			.map(DocumentDto::content)
			.filter(Objects::nonNull)
			.map(DocumentContent::getDocumentTag)
			.collect(Collectors.toSet());

		List<DocumentTag> requiredTags = Stream.concat(
			Arrays.stream(DocumentTag.values()),
			consultation.getEmploymentType().getRequiredDocumentTags().stream()
		).toList();

		return requiredTags.stream()
			.filter(tag -> !submittedTags.contains(tag))
			.map(DocumentConverter::toDocumentMissingDocument)
			.toList();
	}

	private List<DocumentViolation> validateEach(
		final List<DocumentDto> documents,
		final Consultation consultation
	) {
		return documents.stream()
			.filter(doc -> doc.content() != null)
			.map(doc -> validateDocument(doc, consultation))
			.filter(Objects::nonNull)
			.toList();
	}

	private DocumentViolation validateDocument(final DocumentDto doc, final Consultation consultation) {
		DocumentContent content = doc.content();
		DocumentTag tag = content.getDocumentTag();

		DocumentContentValidator<?> validator = validatorMap.get(tag);

		if (validator == null) {
			return null;
		}

		ValidationContext context = new ValidationContext(
			consultation.getName(),
			consultation.getResidentRegistrationNumber()
		);
		List<String> fields = invokeValidator(validator, content, context);

		if (CollectionUtils.isEmpty(fields)) {
			return null;
		}

		return DocumentConverter.toDocumentViolation(tag, fields);
	}

	private List<DocumentViolation> validateCrossDocuments(
		final List<DocumentDto> documents,
		final Consultation consultation
	) {
		Map<CrossField, String> baselines = buildBaselines(consultation);

		Map<CrossField, Map<DocumentTag, String>> fieldsByType = collectCrossFields(documents);

		List<DocumentViolation> violations = new ArrayList<>();

		for (Map.Entry<CrossField, Map<DocumentTag, String>> entry : fieldsByType.entrySet()) {
			CrossField crossField = entry.getKey();
			Map<DocumentTag, String> valuesByDoc = entry.getValue();

			if (isConsistent(valuesByDoc)) {
				continue;
			}

			String baseline = baselines.get(crossField);
			String fieldName = crossField.getFieldName();

			valuesByDoc.entrySet().stream()
				.filter(e -> !e.getValue().equals(baseline))
				.map(Map.Entry::getKey)
				.map(tag -> DocumentConverter.toDocumentViolation(tag, List.of(fieldName)))
				.forEach(violations::add);
		}

		return violations;
	}

	private Map<CrossField, String> buildBaselines(final Consultation consultation) {
		Map<CrossField, String> baselines = new EnumMap<>(CrossField.class);
		if (consultation.getName() != null) {
			baselines.put(CrossField.LOAN_APPLICANT_NAME, consultation.getName());
		}
		if (consultation.getResidentRegistrationNumber() != null) {
			baselines.put(CrossField.RESIDENT_REGISTRATION_NUMBER,
				consultation.getResidentRegistrationNumber());
		}
		return baselines;
	}

	private Map<CrossField, Map<DocumentTag, String>> collectCrossFields(final List<DocumentDto> documents) {
		Map<CrossField, Map<DocumentTag, String>> result = new EnumMap<>(CrossField.class);

		for (DocumentDto doc : documents) {
			if (doc.content() == null) {
				continue;
			}

			DocumentContent content = doc.content();
			DocumentTag tag = content.getDocumentTag();
			Map<CrossField, String> crossFields = content.getCrossCheckFields();

			for (Map.Entry<CrossField, String> entry : crossFields.entrySet()) {
				result.computeIfAbsent(entry.getKey(), _ -> new EnumMap<>(DocumentTag.class))
					.putIfAbsent(tag, entry.getValue());
			}
		}

		return result;
	}

	private boolean isConsistent(final Map<DocumentTag, String> valuesByDoc) {
		return valuesByDoc.size() <= 1 || valuesByDoc.values().stream().distinct().count() == 1;
	}

	@SuppressWarnings("unchecked")
	private <T extends DocumentContent> List<String> invokeValidator(
		final DocumentContentValidator<T> validator,
		final DocumentContent content,
		final ValidationContext context
	) {
		return validator.validate((T)content, context);
	}
}