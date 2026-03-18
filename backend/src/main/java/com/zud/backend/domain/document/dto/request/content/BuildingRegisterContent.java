package com.zud.backend.domain.document.dto.request.content;

import java.util.List;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "집합건축물대장 (FILE_015)")
@Builder
public record BuildingRegisterContent(
    @Schema(description = "위반건축물 여부")
    DataField<Boolean> isViolationBuilding,
    @Schema(description = "주용도")
    DataField<String> mainUsage,
    @Schema(description = "층별현황")
    List<FloorStatus> floorStatusList
) implements DocumentContent {

    @Schema(description = "층별 현황 정보")
    @Builder
    public record FloorStatus(
        @Schema(description = "층")
        DataField<String> floor,
        @Schema(description = "용도")
        DataField<String> usage,
        @Schema(description = "면적")
        DataField<Double> area
    ) {}

    @Override
    public DocumentTag getDocumentTag() {
        return DocumentTag.FILE_015_BUILDING_REGISTER;
    }
}
