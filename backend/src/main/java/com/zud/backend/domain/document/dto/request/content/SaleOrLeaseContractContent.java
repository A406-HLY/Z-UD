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
	Party seller,
	@Schema(description = "매수인/임차인")
	Party buyer
) implements DocumentContent {

	@Schema(description = "계약 당사자 정보")
	@Builder
	public record Party(
		@Schema(description = "성명")
		DataField<String> name,
		@Schema(description = "주소")
		DataField<String> address,
		@Schema(description = "주민등록번호")
		DataField<String> registrationNumber
	) {
	}

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_016_SALE_CONTRACT;
	}

	@Override
	public Map<CrossField, String> getCrossCheckFields() {
		Map<CrossField, String> fields = new EnumMap<>(CrossField.class);
		if (seller != null && seller.name() != null && seller.name().value() != null) {
			fields.put(CrossField.TARGET_PROPERTY_OWNER_NAME, seller.name().value());
		}

		if (buyer != null && buyer.name() != null && buyer.name().value() != null) {
			fields.put(CrossField.LOAN_APPLICANT_NAME, buyer.name().value());
		}
		return fields;
	}
}
