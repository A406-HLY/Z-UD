package com.zud.backend.domain.document.dto.request.content;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "매매/임대차계약서 (FILE_016)")
@Builder
public record SaleOrLeaseContractContent(
	@Schema(description = "소재지")
	DataField<String> propertyAddress,
	@Schema(description = "매매대금/보증금")
	DataField<Long> salePrice,
	@Schema(description = "특약사항")
	DataField<String> specialTerms,
	@Schema(description = "매도인/임대인")
	Party seller,
	@Schema(description = "매수인/임차인")
	Party buyer
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_016_SALE_OR_LEASE_CONTRACT;
	}

	@Schema(description = "계약 당사자")
	@Builder
	public record Party(
		@Schema(description = "성명")
		DataField<String> name
	) {
	}
}
