package com.zud.backend.domain.audit.dto.external.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExternalCreditRatingReqDto(
	@JsonProperty("Header")
	ExternalHeaderReqDto header
) {
}
