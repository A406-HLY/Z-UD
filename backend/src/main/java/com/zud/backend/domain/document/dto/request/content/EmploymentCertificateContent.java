package com.zud.backend.domain.document.dto.request.content;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "재직증명서 (FILE_004)")
@Builder
public record EmploymentCertificateContent(
    @Schema(description = "대표자 성명")
    DataField<String> representativeName,
    @Schema(description = "회사 직인 여부")
    DataField<Boolean> hasCompanySeal
) implements DocumentContent {

    @Override
    public DocumentTag getDocumentTag() {
        return DocumentTag.FILE_004_EMPLOYMENT_CERTIFICATE;
    }
}
