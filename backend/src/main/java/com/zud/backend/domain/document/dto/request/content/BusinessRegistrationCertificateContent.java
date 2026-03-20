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
	@Schema(description = "대표자성명")
	DataField<String> representativeName,
	@Schema(description = "법인등록번호")
	DataField<String> corporateRegistrationNumber,
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
		if (representativeName != null && representativeName.value() != null) {
			fields.put(CrossField.CUSTOMER_NAME, representativeName.value());
		}
		if (businessName != null && businessName.value() != null) {
			fields.put(CrossField.BUSINESS_NAME, businessName.value());
		}
		if (businessRegistrationNumber != null && businessRegistrationNumber.value() != null) {
			fields.put(CrossField.BUSINESS_REGISTRATION_NUMBER, businessRegistrationNumber().value());
		}

		return fields;
	}
}
