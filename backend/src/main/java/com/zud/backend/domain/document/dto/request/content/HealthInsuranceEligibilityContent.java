package com.zud.backend.domain.document.dto.request.content;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "건강보험자격득실확인서 (FILE_004)")
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
    @Schema(description = "최근자격취득일자")
    DataField<String> latestAcquisitionDate,
    @Schema(description = "최근자격상실일자")
    DataField<String> latestLossDate
) implements DocumentContent {

    @Override
    public DocumentTag getDocumentTag() {
        return DocumentTag.FILE_005_HEALTH_INSURANCE_ELIGIBILITY;
    }
}
