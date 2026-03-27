package com.zud.backend.domain.notification.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "테스트 알림 발송 요청 DTO")
public record TestNotificationReqDto(
	@Schema(description = "알림 수신 대상 사용자 ID (null이면 요청자 본인)", example = "1")
	Long targetUserId,
	@Schema(description = "이벤트 타입 (미입력 시 TEST_NOTIFICATION)", example = "TEST_NOTIFICATION")
	String eventType,
	@Schema(description = "알림 메시지 (미입력 시 기본 메시지)", example = "테스트 알림입니다.")
	String message,
	@Schema(description = "추가 메타데이터")
	Object data
) {
}

