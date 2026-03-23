package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "부가가치세과세표준증명 (FILE_010)")
@Builder
public record VatTaxBaseCertificateContent(
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "대표자성명")
	DataField<String> name,
	@Schema(description = "법인등록번호")
	DataField<String> residentRegistrationNumber,
	@Schema(description = "상호(법인명)")
	DataField<String> businessName,
	@Schema(description = "사업자등록번호")
	DataField<String> businessRegistrationNumber,
	@Schema(description = "발급일자")
	DataField<String> issueDate,
	@Schema(description = "과세매출금액")
	DataField<Long> taxableSalesAmount
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_010_VAT_TAX_BASE_CERTIFICATE;
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
