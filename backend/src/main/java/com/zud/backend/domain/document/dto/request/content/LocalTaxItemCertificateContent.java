package com.zud.backend.domain.document.dto.request.content;

import java.util.List;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "지방세세목별과세증명 (FILE_013)")
@Builder
public record LocalTaxItemCertificateContent(
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "발급일자")
	DataField<String> issueDate,
	@Schema(description = "성명(법인명)")
	DataField<String> nameOrCorporateName,
	@Schema(description = "주민(법인/사업자)등록번호")
	DataField<String> identifierNumber,
	@Schema(description = "과세 내역")
	List<TaxItem> taxItems
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_013_LOCAL_TAX_ITEM_CERTIFICATE;
	}

	@Schema(description = "과세 항목")
	@Builder
	public record TaxItem(
		@Schema(description = "세목")
		DataField<String> taxItemName,
		@Schema(description = "과세액")
		DataField<Long> taxAmount,
		@Schema(description = "비고")
		DataField<String> remark
	) {
	}
}
