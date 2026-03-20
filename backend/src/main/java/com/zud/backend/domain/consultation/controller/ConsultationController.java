package com.zud.backend.domain.consultation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zud.backend.common.annotation.Authentication;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.consultation.dto.request.CustomerInfoReqDto;
import com.zud.backend.domain.consultation.dto.response.CustomerInfoResDto;
import com.zud.backend.domain.consultation.service.facade.ConsultationFacadeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/consultations")
@Tag(name = "상담 API", description = "상담 관련 API")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ConsultationController {

	private final ConsultationFacadeService facadeService;

	@PostMapping
	@Operation(summary = "고객 정보 등록", description = "상담을 위한 고객 정보를 등록합니다.")
	public ResponseEntity<BaseResponse<CustomerInfoResDto>> registerCustomerInfo(
		@Authentication Long userId,
		@Valid @RequestBody CustomerInfoReqDto reqDto
	) {
		CustomerInfoResDto response = facadeService.register(userId, reqDto);
		return ResponseUtils.created(response);
	}
}
