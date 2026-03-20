package com.zud.backend.domain.audit.dto.external.request;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExternalInquireRepaymentRecordsReqDto(
	@JsonProperty("Header")
	ExternalHeaderReqDto header,

	String accountNo
) {
	public ExternalInquireRepaymentRecordsReqDto {
		Objects.requireNonNull(header, "header는 필수입니다.");
		Objects.requireNonNull(accountNo, "accountNo는 필수입니다.");
	}
}
