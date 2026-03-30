package com.zud.backend.domain.houseprice.service.query;

import java.util.List;
import java.util.Optional;

import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;
import com.zud.backend.domain.houseprice.entity.HouseTradePrice;
import com.zud.backend.domain.houseprice.util.ParsedAddress;

public interface HousePriceQueryService {

	Optional<HouseTradePrice> findExactTradePrice(String dbHouseType, ParsedAddress parsedAddress);

	Optional<HouseOfficialPrice> findExactOfficialPrice(ParsedAddress parsedAddress);

	List<HouseTradePrice> findLowestTradePricesByBuildingDetail(
		String dbHouseType, ParsedAddress parsedAddress
	);

	List<HouseTradePrice> findLowestTradePricesByBuilding(
		String dbHouseType, ParsedAddress parsedAddress
	);

	List<HouseOfficialPrice> findLowestOfficialPricesByBuildingDetail(ParsedAddress parsedAddress);

	List<HouseOfficialPrice> findLowestOfficialPricesByBuilding(ParsedAddress parsedAddress);
}
