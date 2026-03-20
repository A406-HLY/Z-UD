package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "소득금액증명원 (FILE_008)")
@Builder
public record IncomeAmountCertificateContent(
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "성명")
	DataField<String> name,
	@Schema(description = "주민등록번호")
	DataField<String> residentRegistrationNumber,
	@Schema(description = "상호명")
	DataField<String> businessName,
	@Schema(description = "사업자등록번호")
	DataField<String> businessRegistrationNumber,
	@Schema(description = "발급일자")
	DataField<String> issueDate,
	@Schema(description = "귀속연도")
	DataField<String> incomeYear,
	@Schema(description = "소득금액")
	DataField<Long> incomeAmount,
	@Schema(description = "결정세액")
	DataField<Long> determinedTaxAmount
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_008_INCOME_AMOUNT_CERTIFICATE;
	}

	@Override
	public Map<CrossField, String> getCrossCheckFields() {
		Map<CrossField, String> fields = new EnumMap<>(CrossField.class);
		if (name != null && name.value() != null) {
			fields.put(CrossField.CUSTOMER_NAME, name.value());
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
