package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "가족관계증명서 (FILE_003)")
@Builder
public record FamilyRelationCertificateContent(
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "본인 성명")
	DataField<String> name,
	@Schema(description = "본인 주민등록번호")
	DataField<String> residentRegistrationNumber,
	@Schema(description = "배우자 정보")
	Spouse spouse
) implements DocumentContent {

	public record Spouse(
		DataField<Boolean> exists,
		DataField<String> name,
		DataField<String> residentRegistrationNumber
	) {
	}

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_003_FAMILY_RELATION_CERTIFICATE;
	}

	@Override
	public Map<CrossField, String> getCrossCheckFields() {
		Map<CrossField, String> fields = new EnumMap<>(CrossField.class);
		if (name != null && name.value() != null) {
			fields.put(CrossField.LOAN_APPLICANT_NAME, name.value());
		}
		if (residentRegistrationNumber != null && residentRegistrationNumber.value() != null) {
			fields.put(CrossField.RESIDENT_REGISTRATION_NUMBER, residentRegistrationNumber().value());
		}
		return fields;
	}
}
