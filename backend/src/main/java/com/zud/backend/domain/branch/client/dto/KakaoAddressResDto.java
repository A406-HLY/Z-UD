package com.zud.backend.domain.branch.client.dto;

import java.util.List;

public record KakaoAddressResDto(
	List<Document> documents
) {
	public record Document(
		String x,
		String y
	) {
	}
}
