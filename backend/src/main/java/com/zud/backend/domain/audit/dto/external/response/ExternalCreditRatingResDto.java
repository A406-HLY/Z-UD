package com.zud.backend.domain.audit.dto.external.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExternalCreditRatingResDto(
	@JsonProperty("Header")
	ExternalHeaderResDto header,

	@JsonProperty("REC")
	Rec rec
) {
	public record Rec(
		String ratingName,
		String demandDepositAssetValue,
		String depositSavingsAssetValue,
		String totalAssetValue
	) {
	}
}
