package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "근로소득원천징수영수증 (FILE_006)")
@Builder
public record WithholdingTaxCertificateContent(
	@Schema(description = "소득자 성명")
	DataField<String> incomeRecipientName,
	@Schema(description = "소득자 주민등록번호")
	DataField<String> incomeRecipientResidentRegistrationNumber,
	@Schema(description = "근무기간")
	DataField<String> workPeriod,
	@Schema(description = "연간 총 급여액")
	DataField<Long> annualIncomeTotal
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_006_WITHHOLDING_TAX_CERTIFICATE;
	}

	@Override
	public Map<CrossField, String> getCrossCheckFields() {
		Map<CrossField, String> fields = new EnumMap<>(CrossField.class);
		if (incomeRecipientName != null && incomeRecipientName.value() != null) {
			fields.put(CrossField.CUSTOMER_NAME, incomeRecipientName.value());
		}
		if (incomeRecipientResidentRegistrationNumber != null
			&& incomeRecipientResidentRegistrationNumber.value() != null) {
			fields.put(CrossField.RESIDENT_REGISTRATION_NUMBER, incomeRecipientResidentRegistrationNumber.value());
		}
		return fields;
	}
}
