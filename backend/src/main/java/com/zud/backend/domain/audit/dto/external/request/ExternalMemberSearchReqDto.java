package com.zud.backend.domain.audit.dto.external.request;

import java.util.Objects;

public record ExternalMemberSearchReqDto(
	String userId,
	String apiKey
) {
	public ExternalMemberSearchReqDto {
		Objects.requireNonNull(userId, "userId는 필수입니다.");
		Objects.requireNonNull(apiKey, "apiKey는 필수입니다.");
	}
}
