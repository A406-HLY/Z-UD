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
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.notification.dto.request.TestNotificationReqDto;
import com.zud.backend.domain.notification.service.NotificationFacadeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notification")
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationFacadeService notificationFacadeService;

	@GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public SseEmitter subscribe(@RequestParam final String accessToken) {
		return notificationFacadeService.subscribe(accessToken);
	}

	@DeleteMapping("/subscribe")
	public ResponseEntity<BaseResponse<Void>> disconnect(@Authentication Long userId) {
		notificationFacadeService.disconnect(userId);
		return ResponseUtils.noContent();
	}

	@PostMapping("/test")
	public ResponseEntity<BaseResponse<Void>> sendTestNotification(
		@Authentication Long userId,
		@Valid @RequestBody TestNotificationReqDto reqDto
	) {
		notificationFacadeService.sendTestNotification(userId, reqDto);
		return ResponseUtils.noContent();
	}
}
