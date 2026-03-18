package com.zud.backend.domain.document.dto.request.content;

import java.util.List;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "전입세대열람원 (FILE_017)")
@Builder
public record MoveInHouseholdReportContent(
    @Schema(description = "열람일시(출력일)")
    DataField<String> printedAt,
    @Schema(description = "열람대상물건소재지")
    DataField<String> inspectionAddress,
    @Schema(description = "전입세대 목록")
    List<MoveInHousehold> moveInHouseholds
) implements DocumentContent {

    @Schema(description = "전입세대 정보")
    @Builder
    public record MoveInHousehold(
        @Schema(description = "세대주성명")
        DataField<String> headOfHouseholdName,
        @Schema(description = "전입일자")
        DataField<String> moveInDate
    ) {}

    @Override
    public DocumentTag getDocumentTag() {
        return DocumentTag.FILE_017_MOVE_IN_HOUSEHOLD_REPORT;
    }
}
