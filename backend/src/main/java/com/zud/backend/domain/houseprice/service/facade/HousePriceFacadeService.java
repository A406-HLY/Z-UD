package com.zud.backend.domain.houseprice.service.facade;

import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;

public interface HousePriceFacadeService {
	HousePriceResDto findHousePrice(String houseType, String address);
}
