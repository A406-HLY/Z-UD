package com.zud.backend.domain.document.dto.request.content;

import java.util.EnumMap;
import java.util.Map;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.CrossField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "매매/임대차계약서 (FILE_016)")
@Builder
public record SaleOrLeaseContractContent(
	@Schema(description = "부동산 소재지")
	DataField<String> propertyAddress,
	@Schema(description = "매매금액")
	DataField<Long> salePrice,
	@Schema(description = "특약사항")
	DataField<String> specialTerms,
	@Schema(description = "매도인/임대인")
	DataField<String> seller,
	@Schema(description = "매수인/임차인")
	DataField<String> buyer
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_016_SALE_CONTRACT;
	}

	@Override
	public Map<CrossField, String> getCrossCheckFields() {
		Map<CrossField, String> fields = new EnumMap<>(CrossField.class);
		if (seller != null && seller.value() != null) {
			fields.put(CrossField.TARGET_PROPERTY_OWNER_NAME, seller.value());
		}

		if (buyer != null && buyer.value() != null) {
			fields.put(CrossField.LOAN_APPLICANT_NAME, buyer.value());
		}
		return fields;
	}
}
