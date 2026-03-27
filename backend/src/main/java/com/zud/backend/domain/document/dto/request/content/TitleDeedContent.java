package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "등기권리증 (FILE_014)")
@Builder
public record TitleDeedContent(
	@Schema(description = " 등기 유형")
	DataField<String> registrationType,
	@Schema(description = "동·호수 표기 여부")
	DataField<Boolean> hasDongho,
	@Schema(description = "지번")
	DataField<String> lotAddress,
	@Schema(description = "건물 유형")
	DataField<String> buildingType,
	@Schema(description = "건물내역")
	DataField<String> buildingDescription,
	@Schema(description = "대지권의 등기원인 여부")
	DataField<Boolean> hasLandRightCause,
	@Schema(description = "별도등기 여부")
	DataField<Boolean> hasSeparateRegistration,
	@Schema(description = "소유권이전청구권 가등기 여부")
	DataField<Boolean> hasOwnershipTransferClaim,
	@Schema(description = "신탁등기 여부")
	DataField<Boolean> hasTrustRegistration,
	@Schema(description = "소유자명")
	DataField<String> ownerName,
	@Schema(description = "임차보증금")
	DataField<Long> deposit,
	@Schema(description = "선순위권리내역")
	List<SeniorRight> seniorRights
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_014_TITLE_DEED;
	}

	@Schema(description = "선순위권리내역")
	@Builder
	public record SeniorRight(
		@Schema(description = "채권최고액")
		DataField<Long> maximumClaimAmount
	) {
	}

	@Override
	public Map<CrossField, String> getCrossCheckFields() {
		Map<CrossField, String> fields = new EnumMap<>(CrossField.class);
		if (ownerName != null && ownerName.value() != null) {
			fields.put(CrossField.TARGET_PROPERTY_OWNER_NAME, ownerName.value());
		}
		return fields;
	}
}
