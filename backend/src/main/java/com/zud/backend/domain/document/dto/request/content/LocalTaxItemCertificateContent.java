package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "지방세 세목별 과세증명 (FILE_013)")
@Builder
public record LocalTaxItemCertificateContent(
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "발급일자")
	DataField<String> issueDate,
	@Schema(description = "성명")
	DataField<String> name,
	@Schema(description = "주민등록번호")
	DataField<String> residentRegistrationNumber,
	@Schema(description = "과세 내역")
	List<TaxItem> taxItems
) implements DocumentContent {

	@Schema(description = "과세 항목")
	@Builder
	public record TaxItem(
		@Schema(description = "세목")
		DataField<String> taxItemName,
		@Schema(description = "과세액")
		DataField<Long> taxAmount,
		@Schema(description = "비고")
		DataField<String> remark
	) {
	}

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_013_LOCAL_TAX_ITEM_CERTIFICATE;
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
