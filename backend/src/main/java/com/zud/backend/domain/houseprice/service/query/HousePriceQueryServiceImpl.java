package com.zud.backend.domain.houseprice.service.query;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;
import com.zud.backend.domain.houseprice.entity.HouseType;
import com.zud.backend.domain.houseprice.entity.HouseTradePrice;
import com.zud.backend.domain.houseprice.exception.HousePriceException;
import com.zud.backend.domain.houseprice.repository.HouseOfficialPriceRepository;
import com.zud.backend.domain.houseprice.repository.HouseTradePriceRepository;
import com.zud.backend.domain.houseprice.util.AddressParser;
import com.zud.backend.domain.houseprice.util.ParsedAddress;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class HousePriceQueryServiceImpl implements HousePriceQueryService {

	private static final String PRICE_TYPE_TRADE = "실거래가";
	private static final String PRICE_TYPE_OFFICIAL = "공시가";
	private static final String PRICE_TYPE_ESTIMATED = "근삿값";

	private static final String MESSAGE_TRADE = "실거래가 기준으로 조회되었습니다.";
	private static final String MESSAGE_OFFICIAL = "공시가 기준으로 조회되었습니다.";
	private static final String MESSAGE_ESTIMATED = "같은 동의 낮은 주택가 평균값으로 조회되었습니다.";

	private final HouseTradePriceRepository houseTradePriceRepository;
	private final HouseOfficialPriceRepository houseOfficialPriceRepository;

	@Override
	public HousePriceResDto findHousePrice(final String houseType, final String address) {
		validateHouseType(houseType);
		ParsedAddress parsedAddress = parseAddress(address);
		String dbHouseType = convertHouseTypeToDbFormat(houseType);

		return findByPriority(houseType, dbHouseType, address, parsedAddress);
	}

	private ParsedAddress parseAddress(final String address) {
		try {
			return AddressParser.parse(address);
		} catch (final IllegalArgumentException e) {
			throw new HousePriceException(ErrorCode.INVALID_ADDRESS_FORMAT);
		}
	}

	private HousePriceResDto findByPriority(
		final String houseType,
		final String dbHouseType,
		final String address,
		final ParsedAddress parsedAddress
	) {
		final Optional<HousePriceResDto> tradePriceResult =
			findTradePriceResult(houseType, dbHouseType, address, parsedAddress);
		if (tradePriceResult.isPresent()) {
			return tradePriceResult.get();
		}

		final Optional<HousePriceResDto> officialPriceResult =
			findOfficialPriceResult(houseType, address, parsedAddress);
		if (officialPriceResult.isPresent()) {
			return officialPriceResult.get();
		}

		final Optional<HousePriceResDto> estimatedPriceResult =
			findEstimatedPriceResult(houseType, dbHouseType, address, parsedAddress);
		return estimatedPriceResult.orElse(null);
	}

	private void validateHouseType(final String houseType) {
		if (houseType == null) {
			throw new HousePriceException(ErrorCode.INVALID_HOUSE_TYPE);
		}
		HouseType.fromDisplayName(houseType);
	}

	private String convertHouseTypeToDbFormat(final String houseType) {
		return HouseType.fromDisplayName(houseType).getDbCode();
	}

	private Optional<HouseTradePrice> findExactTradePrice(final String dbHouseType, final ParsedAddress parsedAddress) {
		final String fullSigungu = buildFullSigungu(parsedAddress);

		return switch (dbHouseType) {
			case "APARTMENT" -> Optional.ofNullable(
				houseTradePriceRepository.findApartmentExactMatch(
					fullSigungu,
					parsedAddress.getRoadName(),
					parsedAddress.getBuildingName(),
					parsedAddress.getBuildingDong(),
					parsedAddress.getFloor()
				)
			);
			case "SINGLE" -> Optional.ofNullable(
				houseTradePriceRepository.findSingleHouseExactMatch(
					fullSigungu,
					parsedAddress.getRoadName(),
					parsedAddress.getBuildingName()
				)
			);
			case "MULTI_HOUSEHOLD" -> Optional.ofNullable(
				houseTradePriceRepository.findMultiHouseholdExactMatch(
					fullSigungu,
					parsedAddress.getRoadName(),
					parsedAddress.getBuildingName(),
					parsedAddress.getFloor()
				)
			);
			default -> Optional.empty();
		};
	}

	private String buildFullSigungu(final ParsedAddress parsedAddress) {
		if (parsedAddress.getDongRi() != null && !parsedAddress.getDongRi().isBlank()) {
			return parsedAddress.getSido() + " " + parsedAddress.getSigungu() + " " + parsedAddress.getDongRi();
		}
		return parsedAddress.getSido() + " " + parsedAddress.getSigungu();
	}

	private Optional<HousePriceResDto> findTradePriceResult(
		final String houseType,
		final String dbHouseType,
		final String address,
		final ParsedAddress parsedAddress
	) {
		final Optional<HouseTradePrice> tradePrice = findExactTradePrice(dbHouseType, parsedAddress);
		if (tradePrice.isEmpty()) {
			return Optional.empty();
		}

		final Long price = tradePrice.get().getDealAmountManwon();
		log.info("[HousePrice] 실거래가 조회 성공 - houseType: {}, address: {}, price: {}",
			houseType, address, price);

		return Optional.of(
			HousePriceResDto.builder()
				.price(price)
				.priceType(PRICE_TYPE_TRADE)
				.message(MESSAGE_TRADE)
				.build()
		);
	}

	private Optional<HouseOfficialPrice> findExactOfficialPrice(final ParsedAddress parsedAddress) {
		return Optional.ofNullable(
			houseOfficialPriceRepository.findExactMatch(
				parsedAddress.getRoadAddress(),
				parsedAddress.getBuildingName(),
				parsedAddress.getBuildingDong(),
				parsedAddress.getHo()
			)
		);
	}

	private Optional<HousePriceResDto> findOfficialPriceResult(
		final String houseType,
		final String address,
		final ParsedAddress parsedAddress
	) {
		final Optional<HouseOfficialPrice> officialPrice = findExactOfficialPrice(parsedAddress);
		if (officialPrice.isEmpty()) {
			return Optional.empty();
		}

		final Long price = officialPrice.get().getOfficialPrice() / 10000;
		log.info("[HousePrice] 공시가 조회 성공 - houseType: {}, address: {}, price: {}",
			houseType, address, price);

		return Optional.of(
			HousePriceResDto.builder()
				.price(price)
				.priceType(PRICE_TYPE_OFFICIAL)
				.message(MESSAGE_OFFICIAL)
				.build()
		);
	}

	private Optional<Long> findEstimatedPriceValue(final String dbHouseType, final ParsedAddress parsedAddress) {
		final String fullSigungu = buildFullSigungu(parsedAddress);

		// 1단계: 실거래 - 건물명 + 동 + 층 우선
		final List<HouseTradePrice> tradeByDetail = houseTradePriceRepository.findLowestPricesByBuildingDetail(
			dbHouseType,
			fullSigungu,
			parsedAddress.getRoadName(),
			parsedAddress.getBuildingName(),
			parsedAddress.getBuildingDong(),
			parsedAddress.getFloor()
		);
		if (!tradeByDetail.isEmpty()) {
			return Optional.of(avgManwon(tradeByDetail));
		}

		// 2단계: 실거래 - 건물명까지만
		final List<HouseTradePrice> tradeByBuilding = houseTradePriceRepository.findLowestPricesByBuilding(
			dbHouseType,
			fullSigungu,
			parsedAddress.getRoadName(),
			parsedAddress.getBuildingName()
		);
		if (!tradeByBuilding.isEmpty()) {
			return Optional.of(avgManwon(tradeByBuilding));
		}

		// 3단계: 공시가 - 단지명 + 동 + 호 우선
		final List<HouseOfficialPrice> officialByDetail =
			houseOfficialPriceRepository.findLowestPricesByBuildingDetail(
			parsedAddress.getRoadAddress(),
			parsedAddress.getBuildingName(),
			parsedAddress.getBuildingDong(),
			parsedAddress.getHo()
		);
		if (!officialByDetail.isEmpty()) {
			return Optional.of(avgOfficial(officialByDetail));
		}

		// 4단계: 공시가 - 단지명까지만
		final List<HouseOfficialPrice> officialByBuilding =
			houseOfficialPriceRepository.findLowestPricesByBuilding(
			parsedAddress.getRoadAddress(),
			parsedAddress.getBuildingName()
		);
		if (!officialByBuilding.isEmpty()) {
			return Optional.of(avgOfficial(officialByBuilding));
		}

		return Optional.empty();
	}

	private long avgManwon(final List<HouseTradePrice> tradePrices) {
		final double average = tradePrices.stream()
			.mapToLong(HouseTradePrice::getDealAmountManwon)
			.average()
			.orElse(0.0);
		return Math.round(average);
	}

	private long avgOfficial(final List<HouseOfficialPrice> officialPrices) {
		final double average = officialPrices.stream()
			.mapToLong(p -> p.getOfficialPrice() / 10000)
			.average()
			.orElse(0.0);
		return Math.round(average);
	}

	private Optional<HousePriceResDto> findEstimatedPriceResult(
		final String houseType,
		final String dbHouseType,
		final String address,
		final ParsedAddress parsedAddress
	) {
		final Optional<Long> estimatedPrice = findEstimatedPriceValue(dbHouseType, parsedAddress);
		if (estimatedPrice.isEmpty()) {
			return Optional.empty();
		}

		final Long price = estimatedPrice.get();
		log.info("[HousePrice] 근삿값 조회 성공 - houseType: {}, address: {}, price: {}",
			houseType, address, price);

		return Optional.of(
			HousePriceResDto.builder()
				.price(price)
				.priceType(PRICE_TYPE_ESTIMATED)
				.message(MESSAGE_ESTIMATED)
				.build()
		);
	}
}
