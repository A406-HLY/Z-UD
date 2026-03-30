package com.zud.backend.domain.audit.dto.external.response;

public record ExternalHeaderResDto(
	String responseCode,
	String responseMessage,
	String apiName,
	String transmissionDate,
	String transmissionTime,
	String institutionCode,
	String fintechAppNo,
	String apiServiceCode,
	String institutionTransactionUniqueNo
) {
}
