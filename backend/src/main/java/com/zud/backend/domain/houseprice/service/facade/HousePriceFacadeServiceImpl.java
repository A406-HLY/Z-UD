package com.zud.backend.domain.houseprice.service.facade;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
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

	private static final String PRICE_TYPE_TRADE = "실거래가";
	private static final String PRICE_TYPE_OFFICIAL = "공시가";
	private static final String PRICE_TYPE_ESTIMATED = "근삿값";

	private static final String MESSAGE_TRADE = "실거래가 기준으로 조회되었습니다.";
	private static final String MESSAGE_OFFICIAL = "공시가 기준으로 조회되었습니다.";
	private static final String MESSAGE_ESTIMATED = "같은 동의 낮은 주택가 평균값으로 조회되었습니다.";

	private final HousePriceQueryService housePriceQueryService;

	@Override
	public HousePriceResDto findHousePrice(final String houseType, final String address) {
		validateHouseType(houseType);

		ParsedAddress parsedAddress = parseAddress(address);
		String dbHouseType = HouseType.fromDisplayName(houseType).getDbCode();

		// 1순위: 실거래가(정확 매칭)
		return findByPriority(dbHouseType, parsedAddress);
	}

	private HousePriceResDto findByPriority(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
		// 1) 실거래가 정확 매칭
		return housePriceQueryService.findExactTradePrice(dbHouseType, parsedAddress)
			.map(tradePrice -> HousePriceResDto.builder()
				.price(tradePrice.getDealAmountManwon())
				.priceType(PRICE_TYPE_TRADE)
				.message(MESSAGE_TRADE)
				.build())
			.orElseGet(() -> findOfficialResult(dbHouseType, parsedAddress));
	}

	private HousePriceResDto findOfficialResult(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
		return housePriceQueryService.findExactOfficialPrice(parsedAddress)
			.map(officialPrice -> HousePriceResDto.builder()
				.price(officialPrice.getOfficialPrice() / 10000)
				.priceType(PRICE_TYPE_OFFICIAL)
				.message(MESSAGE_OFFICIAL)
				.build())
			.orElseGet(() -> findEstimatedResult(dbHouseType, parsedAddress));
	}

	private HousePriceResDto findEstimatedResult(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
		// 추정값은 "동/층이 있는 정확도 우선" 순으로 진행합니다.
		// (facade가 우선순위를 결정하고 query service는 데이터 조회만 담당)
		List<HouseTradePrice> tradeByDetail = housePriceQueryService.findLowestTradePricesByBuildingDetail(
			dbHouseType, parsedAddress
		);
		if (!tradeByDetail.isEmpty()) {
			return estimatedFromTrade(tradeByDetail);
		}

		List<HouseTradePrice> tradeByBuilding = housePriceQueryService.findLowestTradePricesByBuilding(
			dbHouseType, parsedAddress
		);
		if (!tradeByBuilding.isEmpty()) {
			return estimatedFromTrade(tradeByBuilding);
		}

		List<HouseOfficialPrice> officialByDetail = housePriceQueryService.findLowestOfficialPricesByBuildingDetail(
			parsedAddress
		);
		if (!officialByDetail.isEmpty()) {
			return estimatedFromOfficial(officialByDetail);
		}

		List<HouseOfficialPrice> officialByBuilding = housePriceQueryService.findLowestOfficialPricesByBuilding(
			parsedAddress
		);
		if (!officialByBuilding.isEmpty()) {
			return estimatedFromOfficial(officialByBuilding);
		}

		return null;
	}

	private HousePriceResDto estimatedFromTrade(final List<HouseTradePrice> tradePrices) {
		Long avgManwon = avgManwon(tradePrices);
		return HousePriceResDto.builder()
			.price(avgManwon)
			.priceType(PRICE_TYPE_ESTIMATED)
			.message(MESSAGE_ESTIMATED)
			.build();
	}

	private HousePriceResDto estimatedFromOfficial(final List<HouseOfficialPrice> officialPrices) {
		Long avgPrice = avgOfficial(officialPrices);
		return HousePriceResDto.builder()
			.price(avgPrice)
			.priceType(PRICE_TYPE_ESTIMATED)
			.message(MESSAGE_ESTIMATED)
			.build();
	}

	private long avgManwon(final List<HouseTradePrice> tradePrices) {
		double average = tradePrices.stream()
			.mapToLong(HouseTradePrice::getDealAmountManwon)
			.average()
			.orElse(0.0);
		return Math.round(average);
	}

	private long avgOfficial(final List<HouseOfficialPrice> officialPrices) {
		double average = officialPrices.stream()
			.mapToLong(p -> p.getOfficialPrice() / 10000)
			.average()
			.orElse(0.0);
		return Math.round(average);
	}

	private void validateHouseType(final String houseType) {
		if (houseType == null) {
			throw new HousePriceException(ErrorCode.INVALID_HOUSE_TYPE);
		}
		HouseType.fromDisplayName(houseType);
	}

	private ParsedAddress parseAddress(final String address) {
		try {
			return AddressParser.parse(address);
		} catch (final IllegalArgumentException e) {
			throw new HousePriceException(ErrorCode.INVALID_ADDRESS_FORMAT);
		}
	}
}
