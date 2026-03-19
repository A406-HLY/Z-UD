package com.zud.backend.domain.audit.dto.external.request;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.zud.backend.domain.audit.dto.external.response.ExternalHeaderResDto;

public record ExternalInquireRepaymentRecordsReqDto(
	@JsonProperty("Header")
	ExternalHeaderResDto header,

	String accountNo
) {
	public ExternalInquireRepaymentRecordsReqDto {
		Objects.requireNonNull(header, "header는 필수입니다.");
		Objects.requireNonNull(accountNo, "accountNo는 필수입니다.");
	}
}
