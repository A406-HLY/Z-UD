package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "집합건축물대장 (FILE_015)")
@Builder
public record BuildingRegisterContent(
	@Schema(description = "소유자명")
	DataField<String> ownerName,
	@Schema(description = "주용도")
	DataField<String> mainUsage,
	@Schema(description = "층별현황")
	List<FloorStatus> floorStatusList
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_015_BUILDING_REGISTER;
	}

	@Schema(description = "층별 현황 정보")
	@Builder
	public record FloorStatus(
		@Schema(description = "층")
		DataField<String> floor,
		@Schema(description = "용도")
		DataField<String> usage,
		@Schema(description = "면적")
		DataField<Double> area
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
