package com.zud.backend.domain.document.dto.request.content;

import java.util.List;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "가족관계증명서 (FILE_003)")
@Builder
public record FamilyRelationCertificateContent(
    @Schema(description = "발급번호")
    DataField<String> issueNumber,
    @Schema(description = "본인 성명")
    DataField<String> name,
    @Schema(description = "본인 주민등록번호")
    DataField<String> residentRegistrationNumber,
    @Schema(description = "배우자 정보")
    Spouse spouse,
    @Schema(description = "자녀 목록")
    List<Child> children
) implements DocumentContent {

    @Schema(description = "배우자 정보")
    @Builder
    public record Spouse(
        @Schema(description = "배우자 존재 여부")
        DataField<Boolean> exists,
        @Schema(description = "배우자 성명")
        DataField<String> name,
        @Schema(description = "배우자 주민등록번호")
        DataField<String> residentRegistrationNumber
    ) {}

    @Schema(description = "자녀 정보")
    @Builder
    public record Child(
        @Schema(description = "자녀 성명")
        DataField<String> name,
        @Schema(description = "자녀 주민등록번호")
        DataField<String> residentRegistrationNumber,
        @Schema(description = "성인 여부")
        DataField<Boolean> isAdult
    ) {}

    @Override
    public DocumentTag getDocumentTag() {
        return DocumentTag.FILE_003_FAMILY_RELATION_CERTIFICATE;
    }
}
