package com.zud.backend.domain.audit.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zud.backend.common.annotation.Authentication;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.audit.dto.request.AuditHouseReqDto;
import com.zud.backend.domain.audit.dto.request.MyDataReqDto;
import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;
import com.zud.backend.domain.audit.service.facade.AuditHouseFacadeService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Tag(name = "심사 (audit)", description = "심사 관련 API")
@RestController
@RequestMapping("/api/v1/audits")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditController {

	private final AuditHouseFacadeService auditHouseFacadeService;

	@PostMapping("/house")
	public ResponseEntity<BaseResponse<AuditHouseResDto>> auditHouse(
		@Authentication Long userId,
		@Valid @RequestBody AuditHouseReqDto reqDto
	) {
		AuditHouseResDto response = auditHouseFacadeService.auditHouse(userId, reqDto);
		return ResponseUtils.ok(response);
	}

	@PostMapping("/my-data")
	public ResponseEntity<BaseResponse<MyDataResDto>> getMyData(@Valid @RequestBody MyDataReqDto reqDto) {
		MyDataResDto response = auditHouseFacadeService.getMyData(reqDto);
		return ResponseUtils.ok(response);
	}
}

