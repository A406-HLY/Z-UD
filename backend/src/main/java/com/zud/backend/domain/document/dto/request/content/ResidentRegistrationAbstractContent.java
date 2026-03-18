package com.zud.backend.domain.document.dto.request.content;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "주민등록초본 (FILE_002)")
@Builder
public record ResidentRegistrationAbstractContent(
	@Schema(description = "발급일자")
	DataField<String> issueDate,
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "현주소지")
	DataField<String> currentAddress
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_002_RESIDENT_REGISTRATION_ABSTRACT;
	}
}
