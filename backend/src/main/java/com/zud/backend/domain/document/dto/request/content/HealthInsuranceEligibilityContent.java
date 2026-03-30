package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "건강보험자격득실확인서 (FILE_005)")
@Builder
public record HealthInsuranceEligibilityContent(
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "성명")
	DataField<String> name,
	@Schema(description = "주민등록번호")
	DataField<String> residentRegistrationNumber,
	@Schema(description = "가입자구분")
	DataField<String> subscriberType,
	@Schema(description = "최종 취득일자")
	DataField<String> latestAcquisitionDate,
	@Schema(description = "최종 상실일자")
	DataField<String> latestLossDate
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_005_HEALTH_INSURANCE_ELIGIBILITY;
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
