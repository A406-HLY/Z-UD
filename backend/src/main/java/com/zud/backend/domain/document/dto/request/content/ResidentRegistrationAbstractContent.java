package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "주민등록초본 (FILE_001)")
@Builder
public record ResidentRegistrationAbstractContent(
	@Schema(description = "발급일자")
	DataField<String> issueDate,
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "현주소지")
	DataField<String> name,
	@Schema(description = "주민등록번호")
	DataField<String> residentRegistrationNumber,
	@Schema(description = "현주소지")
	DataField<String> currentAddress,
	@Schema(description = "전입일자")
	DataField<String> moveInDate
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_002_RESIDENT_REGISTRATION_ABSTRACT;
	}

	@Override
	public Map<CrossField, String> getCrossCheckFields() {
		Map<CrossField, String> fields = new EnumMap<>(CrossField.class);
		if (name != null && name.value() != null) {
			fields.put(CrossField.LOAN_APPLICANT_NAME, name().value());
		}
		if (residentRegistrationNumber != null && residentRegistrationNumber.value() != null) {
			fields.put(CrossField.RESIDENT_REGISTRATION_NUMBER, residentRegistrationNumber.value());
		}
		return fields;
	}
}
