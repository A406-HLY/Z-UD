package com.zud.backend.domain.houseprice.service.facade;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.houseprice.converter.HousePriceConverter;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;
import com.zud.backend.domain.houseprice.entity.HouseTradePrice;
import com.zud.backend.domain.houseprice.entity.HouseType;
import com.zud.backend.domain.houseprice.exception.HousePriceException;
import com.zud.backend.domain.houseprice.service.query.HousePriceQueryService;
import com.zud.backend.domain.houseprice.util.AddressParser;
import com.zud.backend.domain.houseprice.util.ParsedAddress;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class HousePriceFacadeServiceImpl implements HousePriceFacadeService {

	private final HousePriceQueryService housePriceQueryService;

	@Override
	public HousePriceResDto findHousePrice(final String houseType, final String address) {
		HouseType resolvedType = validateHouseType(houseType);

		ParsedAddress parsedAddress = parseAddress(address);
		String dbHouseType = resolvedType.getDbCode();

		if (resolvedType == HouseType.MULTI_HOUSEHOLD) {
			return findOfficialOnly(dbHouseType, parsedAddress);
		}

		// 1순위: 실거래가(정확 매칭)
		return findByPriority(dbHouseType, parsedAddress);
	}

	private HousePriceResDto findOfficialOnly(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
		return findOfficialResult(dbHouseType, parsedAddress, true);
	}

	private HousePriceResDto findByPriority(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
		return housePriceQueryService.findExactTradePrice(dbHouseType, parsedAddress)
			.map(HousePriceConverter::toResDtoFromExactTrade)
			.orElseGet(() -> findOfficialResult(dbHouseType, parsedAddress, false));
	}

	private HousePriceResDto findOfficialResult(
		final String dbHouseType,
		final ParsedAddress parsedAddress,
		final boolean skipTradeEstimates
	) {
		return housePriceQueryService.findExactOfficialPrice(parsedAddress)
			.map(HousePriceConverter::toResDtoFromExactOfficial)
			.orElseGet(() -> findEstimatedResult(dbHouseType, parsedAddress, skipTradeEstimates));
	}

	private HousePriceResDto findEstimatedResult(
		final String dbHouseType,
		final ParsedAddress parsedAddress,
		final boolean skipTradeEstimates
	) {
		if (!skipTradeEstimates) {
			HousePriceResDto fromTrade = findEstimatedByTrade(dbHouseType, parsedAddress);
			if (fromTrade != null) {
				return fromTrade;
			}
		}
		return findEstimatedByOfficial(parsedAddress);
	}

	private HousePriceResDto findEstimatedByTrade(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
		List<HouseTradePrice> byDetail = housePriceQueryService.findLowestTradePricesByBuildingDetail(
			dbHouseType, parsedAddress
		);
		if (!byDetail.isEmpty()) {
			return HousePriceConverter.toEstimatedFromTrade(byDetail);
		}
		List<HouseTradePrice> byBuilding = housePriceQueryService.findLowestTradePricesByBuilding(
			dbHouseType, parsedAddress
		);
		if (!byBuilding.isEmpty()) {
			return HousePriceConverter.toEstimatedFromTrade(byBuilding);
		}
		return null;
	}

	private HousePriceResDto findEstimatedByOfficial(final ParsedAddress parsedAddress) {
		List<HouseOfficialPrice> byDetail = housePriceQueryService.findLowestOfficialPricesByBuildingDetail(
			parsedAddress
		);
		if (!byDetail.isEmpty()) {
			return HousePriceConverter.toEstimatedFromOfficial(byDetail);
		}
		List<HouseOfficialPrice> byBuilding = housePriceQueryService.findLowestOfficialPricesByBuilding(
			parsedAddress
		);
		if (!byBuilding.isEmpty()) {
			return HousePriceConverter.toEstimatedFromOfficial(byBuilding);
		}
		return null;
	}

	private HouseType validateHouseType(final String houseType) {
		if (houseType == null) {
			throw new HousePriceException(ErrorCode.INVALID_HOUSE_TYPE);
		}
		return HouseType.fromDisplayName(houseType);
	}

	private ParsedAddress parseAddress(final String address) {
		try {
			return AddressParser.parse(address);
		} catch (final IllegalArgumentException e) {
			throw new HousePriceException(ErrorCode.INVALID_ADDRESS_FORMAT);
		}
	}
}
