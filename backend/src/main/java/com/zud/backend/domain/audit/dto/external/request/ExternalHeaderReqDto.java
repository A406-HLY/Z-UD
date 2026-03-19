package com.zud.backend.domain.audit.dto.external.request;

import java.util.Objects;

import jakarta.annotation.Nullable;

public record ExternalHeaderReqDto(
	String apiName,
	String transmissionDate,
	String transmissionTime,
	String institutionCode,
	String fintechAppNo,
	String apiServiceCode,
	String institutionTransactionUniqueNo,
	String apiKey,
	@Nullable String userKey
) {
	public ExternalHeaderReqDto {
		Objects.requireNonNull(apiName, "apiName은 필수입니다.");
		Objects.requireNonNull(transmissionDate, "transmissionDate는 필수입니다.");
		Objects.requireNonNull(transmissionTime, "transmissionTime는 필수입니다.");
		Objects.requireNonNull(institutionCode, "institutionCode는 필수입니다.");
		Objects.requireNonNull(fintechAppNo, "fintechAppNo는 필수입니다.");
		Objects.requireNonNull(apiServiceCode, "apiServiceCode는 필수입니다.");
		Objects.requireNonNull(institutionTransactionUniqueNo, "institutionTransactionUniqueNo는 필수입니다.");
		Objects.requireNonNull(apiKey, "apiKey는 필수입니다.");
	}
}
