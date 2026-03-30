package com.zud.backend.domain.audit.dto.external.response;

public record ExternalMemberSearchResDto(
	String userId,
	String userName,
	String institutionCode,
	String userKey,
	String created,
	String modified
) {
}
