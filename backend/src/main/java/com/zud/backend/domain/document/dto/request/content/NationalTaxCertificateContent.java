package com.zud.backend.domain.document.dto.request.content;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "국세납세증명 (FILE_011)")
@Builder
public record NationalTaxCertificateContent(
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "발급일자")
	DataField<String> issueDate,
	@Schema(description = "성명(법인명)")
	DataField<String> nameOrCorporateName,
	@Schema(description = "주민(사업자)등록번호")
	DataField<String> residentRegistrationNumberOrBusinessRegistrationNumber
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_011_NATIONAL_TAX_CERTIFICATE;
	}
}
