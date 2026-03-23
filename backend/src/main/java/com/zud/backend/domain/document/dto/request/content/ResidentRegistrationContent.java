package com.zud.backend.domain.document.dto.request.content;

import java.util.List;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "주민등록등본 (FILE_002)")
@Builder
public record ResidentRegistrationContent(
	@Schema(description = "발급일자")
	DataField<String> issueDate,
	@Schema(description = "발급번호")
	DataField<String> issueNumber,
	@Schema(description = "세대원 목록")
	List<HouseholdMember> householdMembers
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_001_RESIDENT_REGISTRATION;
	}

	@Schema(description = "세대원 정보")
	@Builder
	public record HouseholdMember(
		@Schema(description = "성명")
		DataField<String> name,
		@Schema(description = "주민등록번호")
		DataField<String> residentRegistrationNumber
	) {
	}
}
