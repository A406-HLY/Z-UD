package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "재직증명서 (FILE_004)")
@Builder
public record EmploymentCertificateContent(
	@Schema(description = "이름")
	DataField<String> name,
	@Schema(description = "주민등록번호")
	DataField<String> residentRegistrationNumber,
	@Schema(description = "대표자성명")
	DataField<String> hasRepresentativeName,
	@Schema(description = "회사 직인 여부")
	DataField<Boolean> hasCompanySeal
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_004_EMPLOYMENT_CERTIFICATE;
	}

	@Override
	public Map<CrossField, String> getCrossCheckFields() {
		Map<CrossField, String> fields = new EnumMap<>(CrossField.class);
		if (name != null && name.value() != null) {
			fields.put(CrossField.LOAN_APPLICANT_NAME, name.value());
		}
		if (residentRegistrationNumber != null && residentRegistrationNumber.value() != null) {
			fields.put(CrossField.RESIDENT_REGISTRATION_NUMBER, residentRegistrationNumber.value());
		}
		return fields;
	}
}
