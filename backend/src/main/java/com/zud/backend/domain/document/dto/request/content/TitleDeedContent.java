package com.zud.backend.domain.document.dto.request.content;

import java.util.List;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.enums.DocumentTag;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "등기사항전부증명서 (FILE_014)")
@Builder
public record TitleDeedContent(
	@Schema(description = "등기종류")
	DataField<String> registrationType,
	@Schema(description = "건물종류")
	DataField<String> buildingType,
	@Schema(description = "동/호수 존재여부")
	DataField<Boolean> hasDongHo,
	@Schema(description = "소재지번")
	DataField<String> lotAddress,
	@Schema(description = "건물내역")
	DataField<String> buildingDescription,
	@Schema(description = "대지권등기원인")
	DataField<String> landRightRegistrationCause,
	@Schema(description = "별도등기 여부")
	DataField<Boolean> hasSeparateRegistration,
	@Schema(description = "소유권이전가등기 여부")
	DataField<Boolean> hasProvisionalRegistrationForOwnershipTransferClaim,
	@Schema(description = "신탁등기 여부")
	DataField<Boolean> hasTrustRegistration,
	@Schema(description = "소유자명")
	DataField<String> ownerName,
	@Schema(description = "선순위권리내역")
	List<SeniorRight> seniorRights
) implements DocumentContent {

	@Override
	public DocumentTag getDocumentTag() {
		return DocumentTag.FILE_014_TITLE_DEED;
	}

	@Schema(description = "선순위 권리 정보")
	@Builder
	public record SeniorRight(
		@Schema(description = "채권최고액")
		DataField<Long> maximumClaimAmount
	) {
	}
}
