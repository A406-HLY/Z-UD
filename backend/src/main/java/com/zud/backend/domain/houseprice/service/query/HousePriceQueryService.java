package com.zud.backend.domain.houseprice.service.query;

import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;

public interface HousePriceQueryService {
	HousePriceResDto findHousePrice(String houseType, String address);
}
