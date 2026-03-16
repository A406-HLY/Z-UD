package com.zud.backend.domain.houseprice.service.facade;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.domain.houseprice.dto.request.HousePriceReqDto;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.service.query.HousePriceQueryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class HousePriceFacadeServiceImpl implements HousePriceFacadeService {

	private final HousePriceQueryService housePriceQueryService;

	@Override
	public HousePriceResDto findHousePrice(final HousePriceReqDto reqDto) {
		return housePriceQueryService.findHousePrice(reqDto.houseType(), reqDto.address());
	}
}
