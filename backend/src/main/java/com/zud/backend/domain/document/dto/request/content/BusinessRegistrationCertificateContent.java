package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "사업자등록증명 (FILE_009)")
@Builder
public record BusinessRegistrationCertificateContent(
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "상호(법인명)")
	DataField<String> businessName,
	@Schema(description = "사업자등록번호")
	DataField<String> businessRegistrationNumber,
	@Schema(description = "대표자 성명")
	DataField<String> name,
	@Schema(description = "주민등록번호")
	DataField<String> residentRegistrationNumber,
	@Schema(description = "발급일자")
	DataField<String> issueDate
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_009_BUSINESS_REGISTRATION_CERTIFICATE;
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
		if (businessName != null && businessName.value() != null) {
			fields.put(CrossField.BUSINESS_NAME, businessName.value());
		}
		if (businessRegistrationNumber != null && businessRegistrationNumber.value() != null) {
			fields.put(CrossField.BUSINESS_REGISTRATION_NUMBER, businessRegistrationNumber.value());
		}
		return fields;
	}
}
