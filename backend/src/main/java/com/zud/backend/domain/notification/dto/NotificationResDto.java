package com.zud.backend.domain.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record NotificationResDto(
	@Schema(description = "이벤트 타입 (예: OCR_COMPLETED, OCR_FAILED)")
	String eventType,
	@Schema(description = "알림 메시지")
	String message,
	@Schema(description = "이벤트 관련 데이터 (JSON)")
	Object data
) {
}