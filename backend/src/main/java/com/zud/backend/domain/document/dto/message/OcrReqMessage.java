package com.zud.backend.domain.document.dto.message;

import java.util.List;

public record OcrReqMessage(
	String consultationId,
	List<String> documentUrls
) {
}
