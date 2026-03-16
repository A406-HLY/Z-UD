package com.zud.backend.domain.houseprice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zud.backend.common.annotation.Authentication;
import com.zud.backend.common.config.swagger.ApiErrorResponse;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.houseprice.dto.request.HousePriceReqDto;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.service.facade.HousePriceFacadeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Tag(name = "주택 시세 (House Price)", description = "주택 시세 조회 관련 API")
@RestController
@RequestMapping("/api/v1/house-prices")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class HousePriceController {

	private final HousePriceFacadeService housePriceFacadeService;

	@Operation(
		summary = "주택 시세 조회",
		description = "주택 유형과 주소를 기반으로 주택 시세를 조회합니다. 실거래가 > 공시가 > 근삿값 순으로 조회합니다."
	)
	@ApiErrorResponse
	@PostMapping("/search")
	public ResponseEntity<BaseResponse<HousePriceResDto>> findHousePrice(
		@Authentication Long userId,
		@Valid @RequestBody HousePriceReqDto reqDto
	) {
		HousePriceResDto response = housePriceFacadeService.findHousePrice(reqDto);
		return ResponseUtils.ok(response);
	}
}
