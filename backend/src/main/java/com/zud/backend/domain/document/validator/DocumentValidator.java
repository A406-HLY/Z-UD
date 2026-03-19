package com.zud.backend.domain.document.validator;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
import com.zud.backend.domain.document.dto.request.content.MoveInHouseholdReportContent;
import com.zud.backend.domain.document.dto.request.content.TitleDeedContent;
import com.zud.backend.domain.document.dto.response.DocumentMissing;
import com.zud.backend.domain.document.dto.response.DocumentRisk;
import com.zud.backend.domain.document.dto.response.DocumentValidationResult;
import com.zud.backend.domain.document.dto.response.DocumentViolation;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

@Component
public class DocumentValidator {

	private static final List<DocumentTag> COMMON_REQUIRED_TAGS = List.of(
		DocumentTag.FILE_001_RESIDENT_REGISTRATION,
		DocumentTag.FILE_014_TITLE_DEED,
		DocumentTag.FILE_015_BUILDING_REGISTER
	);

	private static final long MOVE_IN_REPORT_VALID_DAYS = 30;

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
			validateEach(documents),
			validateCrossDocuments(documents, consultation),
			validateHeadOfHouseholdOwnership(documents)
		).flatMap(List::stream).toList();

		List<DocumentRisk> risks = validateRisks(documents);

		return DocumentValidationResult.builder()
			.documentMissings(documentMissings)
			.violations(violations)
			.risks(risks)
			.build();
	}

	private List<DocumentMissing> validateRequiredDocuments(
		final List<DocumentDto> documents,
		final Consultation consultation
	) {
		Set<DocumentTag> submittedTags = documents.stream()
			.map(DocumentDto::extraction)
			.filter(Objects::nonNull)
			.map(DocumentDto.ExtractionDetail::content)
			.filter(Objects::nonNull)
			.map(DocumentContent::getDocumentTag)
			.collect(Collectors.toSet());

		List<DocumentTag> requiredTags = Stream.concat(
			COMMON_REQUIRED_TAGS.stream(),
			consultation.getEmploymentType().getRequiredDocumentTags().stream()
		).toList();

		return requiredTags.stream()
			.filter(tag -> !submittedTags.contains(tag))
			.map(DocumentConverter::toDocumentMissingDocument)
			.toList();
	}

	private List<DocumentRisk> validateRisks(final List<DocumentDto> documents) {
		Optional<MoveInHouseholdReportContent> moveInReportOpt = findContentByTag(
			documents, DocumentTag.FILE_017_MOVE_IN_HOUSEHOLD_REPORT
		);

		if (moveInReportOpt.isEmpty()) {
			return List.of();
		}

		List<DocumentRisk> risks = new ArrayList<>();
		validatePrintedAt(moveInReportOpt.get(), risks);
		return risks;
	}

	private void validatePrintedAt(
		final MoveInHouseholdReportContent moveInReport,
		final List<DocumentRisk> risks
	) {
		if (DateValidator.isWithinDays(moveInReport.printedAt(), MOVE_IN_REPORT_VALID_DAYS)) {
			risks.add(DocumentConverter.toDocumentRisk(
				DocumentTag.FILE_017_MOVE_IN_HOUSEHOLD_REPORT, List.of("printedAt")
			));
		}
	}

	private List<DocumentViolation> validateHeadOfHouseholdOwnership(final List<DocumentDto> documents) {
		Optional<MoveInHouseholdReportContent> moveInReportOpt = findContentByTag(
			documents, DocumentTag.FILE_017_MOVE_IN_HOUSEHOLD_REPORT
		);

		if (moveInReportOpt.isEmpty()) {
			return List.of();
		}

		MoveInHouseholdReportContent moveInReport = moveInReportOpt.get();
		String headOfHouseholdName = extractHeadOfHouseholdName(moveInReport);
		if (headOfHouseholdName == null) {
			return List.of();
		}

		Optional<TitleDeedContent> titleDeedOpt = findContentByTag(
			documents, DocumentTag.FILE_014_TITLE_DEED
		);

		String ownerName = titleDeedOpt.map(this::extractOwnerName).orElse(null);

		if (ownerName != null && ownerName.equals(headOfHouseholdName)) {
			return List.of();
		}

		boolean hasLeaseContract = findContentByTag(
			documents, DocumentTag.FILE_016_SALE_OR_LEASE_CONTRACT
		).isPresent();

		if (!hasLeaseContract) {
			return List.of(DocumentConverter.toDocumentViolation(
				DocumentTag.FILE_017_MOVE_IN_HOUSEHOLD_REPORT,
				List.of("headOfHouseholdName")
			));
		}

		return List.of();
	}

	private List<DocumentViolation> validateEach(final List<DocumentDto> documents) {
		return documents.stream()
			.map(this::validateDocument)
			.filter(Objects::nonNull)
			.toList();
	}

	private DocumentViolation validateDocument(final DocumentDto doc) {
		DocumentContent content = doc.extraction().content();
		DocumentTag tag = content.getDocumentTag();

		DocumentContentValidator<?> validator = validatorMap.get(tag);

		if (validator == null) {
			return null;
		}

		List<String> fields = invokeValidator(validator, content);

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

	private String extractHeadOfHouseholdName(final MoveInHouseholdReportContent content) {
		if (CollectionUtils.isEmpty(content.moveInHouseholds())) {
			return null;
		}

		MoveInHouseholdReportContent.MoveInHousehold first = content.moveInHouseholds().getFirst();
		if (first.headOfHouseholdName() == null) {
			return null;
		}
		return first.headOfHouseholdName().value();
	}

	private String extractOwnerName(final TitleDeedContent titleDeed) {
		if (titleDeed == null || titleDeed.ownerName() == null) {
			return null;
		}
		return titleDeed.ownerName().value();
	}

	private Map<CrossField, String> buildBaselines(final Consultation consultation) {
		Map<CrossField, String> baselines = new EnumMap<>(CrossField.class);
		if (consultation.getName() != null) {
			baselines.put(CrossField.CUSTOMER_NAME, consultation.getName());
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
			if (doc.extraction() == null || doc.extraction().content() == null) {
				continue;
			}

			DocumentContent content = doc.extraction().content();
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
	private <T extends DocumentContent> Optional<T> findContentByTag(
		final List<DocumentDto> documents,
		final DocumentTag tag
	) {
		return documents.stream()
			.map(DocumentDto::extraction)
			.filter(Objects::nonNull)
			.filter(extraction -> extraction.content().getDocumentTag() == tag)
			.map(extraction -> (T)extraction.content())
			.findFirst();
	}

	@SuppressWarnings("unchecked")
	private <T extends DocumentContent> List<String> invokeValidator(
		final DocumentContentValidator<T> validator,
		final DocumentContent content
	) {
		return validator.validate((T)content);
	}
}
