package com.zud.backend.domain.document.dto.request.content;

import java.util.List;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "급여통장거래내역서 (FILE_007)")
@Builder
public record SalaryAccountStatementContent(
    @Schema(description = "입금 내역 목록")
    List<DepositItem> depositAmountList,
    @Schema(description = "수동 확인 필요 여부")
    DataField<Boolean> manualReviewRequired
) implements DocumentContent {

    @Schema(description = "입금 내역")
    @Builder
    public record DepositItem(
        @Schema(description = "입금일자")
        DataField<String> depositDate,
        @Schema(description = "입금액")
        DataField<Long> depositAmount
    ) {}

    @Override
    public DocumentTag getDocumentTag() {
        return DocumentTag.FILE_007_SALARY_ACCOUNT_STATEMENT;
    }
}
