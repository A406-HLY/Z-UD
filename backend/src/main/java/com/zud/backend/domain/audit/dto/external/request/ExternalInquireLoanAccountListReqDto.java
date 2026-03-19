package com.zud.backend.domain.audit.dto.external.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExternalInquireLoanAccountListReqDto(
	@JsonProperty("Header")
	ExternalHeaderReqDto header
) {
}
