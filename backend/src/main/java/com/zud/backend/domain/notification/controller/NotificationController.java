package com.zud.backend.domain.notification.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.common.annotation.Authentication;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.domain.counsel.service.CounselStatusService;
import com.zud.backend.domain.notification.service.NotificationFacadeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notification")
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationFacadeService notificationFacadeService;
	private final CounselStatusService counselStatusService;

	@GetMapping(value = "/subscribe}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public SseEmitter subscribe(@Authentication Long userId) {
		return notificationFacadeService.subscribe(userId);
	}

	@DeleteMapping("/subscribe")
	public ResponseEntity<BaseResponse<Void>> disconnect(@Authentication Long userId) {
		notificationFacadeService.disconnect(userId);
		return ResponseEntity.ok(BaseResponse.noContent());
	}

	@GetMapping("/status")
	public ResponseEntity<BaseResponse<CounselStatusResDto>> getStatus(@Authentication Long userId) {
		CounselStatusResDto status = counselStatusService.getStatus(userId);
		return ResponseEntity.ok(BaseResponse.ok(status));
	}
}