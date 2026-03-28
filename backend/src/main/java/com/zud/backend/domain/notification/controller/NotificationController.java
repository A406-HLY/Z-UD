package com.zud.backend.domain.notification.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.common.annotation.Authentication;
import com.zud.backend.common.config.swagger.ApiErrorResponse;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.notification.dto.request.TestNotificationReqDto;
import com.zud.backend.domain.notification.service.NotificationFacadeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Tag(name = "알림 관련 API", description = "SSE 기반 실시간 알림 API")
@RestController
@RequestMapping("/api/v1/notification")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationController {

	private final NotificationFacadeService notificationFacadeService;

	@GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	@Operation(summary = "SSE 구독", description = "SSE 연결을 맺고 실시간 알림을 수신한다.")
	@ApiErrorResponse
	public SseEmitter subscribe(@Parameter(description = "액세스 토큰") @RequestParam final String accessToken) {
		return notificationFacadeService.subscribe(accessToken);
	}

	@DeleteMapping("/subscribe")
	@Operation(summary = "SSE 연결 해제", description = "SSE 연결을 해제한다.")
	@ApiErrorResponse
	public ResponseEntity<BaseResponse<Void>> disconnect(@Parameter(hidden = true) @Authentication Long userId) {
		notificationFacadeService.disconnect(userId);
		return ResponseUtils.noContent();
	}

	@PostMapping("/test")
	@Operation(summary = "테스트 알림 전송", description = "테스트용 알림을 전송한다.")
	@ApiErrorResponse
	public ResponseEntity<BaseResponse<Void>> sendTestNotification(
		@Parameter(hidden = true) @Authentication Long userId,
		@Valid @RequestBody TestNotificationReqDto reqDto
	) {
		notificationFacadeService.sendTestNotification(userId, reqDto);
		return ResponseUtils.noContent();
	}
}
