package com.zud.backend.domain.houseprice.converter;

import java.util.List;

import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;
import com.zud.backend.domain.houseprice.entity.HouseTradePrice;

import lombok.experimental.UtilityClass;

@UtilityClass
public class HousePriceConverter {

	private static final String PRICE_TYPE_TRADE = "실거래가";
	private static final String PRICE_TYPE_OFFICIAL = "공시가";
	private static final String PRICE_TYPE_ESTIMATED = "근삿값";

	private static final String MESSAGE_TRADE = "실거래가 기준으로 조회되었습니다.";
	private static final String MESSAGE_OFFICIAL = "공시가 기준으로 조회되었습니다.";
	private static final String MESSAGE_ESTIMATED = "같은 동의 낮은 주택가 평균값으로 조회되었습니다.";

	public HousePriceResDto toResDtoFromExactTrade(final HouseTradePrice tradePrice) {
		return HousePriceResDto.builder()
			.price(tradePrice.getDealAmountManwon())
			.priceType(PRICE_TYPE_TRADE)
			.message(MESSAGE_TRADE)
			.build();
	}

	public HousePriceResDto toResDtoFromExactOfficial(final HouseOfficialPrice officialPrice) {
		return HousePriceResDto.builder()
			.price(officialPrice.getOfficialPrice() / 10000)
			.priceType(PRICE_TYPE_OFFICIAL)
			.message(MESSAGE_OFFICIAL)
			.build();
	}

	public HousePriceResDto toEstimatedFromTrade(final List<HouseTradePrice> tradePrices) {
		long avgManwon = averageManwon(tradePrices);
		return HousePriceResDto.builder()
			.price(avgManwon)
			.priceType(PRICE_TYPE_ESTIMATED)
			.message(MESSAGE_ESTIMATED)
			.build();
	}

	public HousePriceResDto toEstimatedFromOfficial(final List<HouseOfficialPrice> officialPrices) {
		long avgManwon = averageOfficialManwon(officialPrices);
		return HousePriceResDto.builder()
			.price(avgManwon)
			.priceType(PRICE_TYPE_ESTIMATED)
			.message(MESSAGE_ESTIMATED)
			.build();
	}

	public HousePriceResDto toUnavailableHousePrice(final String message) {
		return HousePriceResDto.builder()
			.price(null)
			.priceType(null)
			.message(message)
			.build();
	}

	private static long averageManwon(final List<HouseTradePrice> tradePrices) {
		double average = tradePrices.stream()
			.mapToLong(HouseTradePrice::getDealAmountManwon)
			.average()
			.orElse(0.0);
		return Math.round(average);
	}

	private static long averageOfficialManwon(final List<HouseOfficialPrice> officialPrices) {
		double average = officialPrices.stream()
			.mapToLong(p -> p.getOfficialPrice() / 10000)
			.average()
			.orElse(0.0);
		return Math.round(average);
	}
}
