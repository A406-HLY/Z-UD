package com.zud.backend.domain.houseprice.service.query;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;
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

	private final HouseTradePriceRepository houseTradePriceRepository;
	private final HouseOfficialPriceRepository houseOfficialPriceRepository;

	@Override
	public HousePriceResDto findHousePrice(String houseType, String address) {
		validateHouseType(houseType);
		ParsedAddress parsedAddress = parseAddress(address);
		String dbHouseType = convertHouseTypeToDbFormat(houseType);

		return findByPriority(houseType, dbHouseType, address, parsedAddress);
	}

	private ParsedAddress parseAddress(String address) {
		try {
			return AddressParser.parse(address);
		} catch (IllegalArgumentException e) {
			throw new HousePriceException(ErrorCode.INVALID_ADDRESS_FORMAT);
		}
	}

	private HousePriceResDto findByPriority(
		String houseType,
		String dbHouseType,
		String address,
		ParsedAddress parsedAddress
	) {
		Optional<HousePriceResDto> tradePriceResult =
			findTradePriceResult(houseType, dbHouseType, address, parsedAddress);
		if (tradePriceResult.isPresent()) {
			return tradePriceResult.get();
		}

		Optional<HousePriceResDto> officialPriceResult =
			findOfficialPriceResult(houseType, address, parsedAddress);
		if (officialPriceResult.isPresent()) {
			return officialPriceResult.get();
		}

		Optional<HousePriceResDto> estimatedPriceResult =
			findEstimatedPriceResult(houseType, dbHouseType, address, parsedAddress);
		return estimatedPriceResult.orElseThrow(() -> new HousePriceException(ErrorCode.HOUSE_PRICE_NOT_FOUND));
	}

	private void validateHouseType(String houseType) {
		if (houseType == null
			|| (!houseType.equals("아파트")
			&& !houseType.equals("다세대연립")
			&& !houseType.equals("단독"))) {
			throw new HousePriceException(ErrorCode.INVALID_HOUSE_TYPE);
		}
	}

	private String convertHouseTypeToDbFormat(String houseType) {
		return switch (houseType) {
			case "아파트" -> "APARTMENT";
			case "다세대연립" -> "MULTI_HOUSEHOLD";
			case "단독" -> "SINGLE";
			default -> throw new HousePriceException(ErrorCode.INVALID_HOUSE_TYPE);
		};
	}

	private Optional<HouseTradePrice> findExactTradePrice(String dbHouseType, ParsedAddress parsedAddress) {
		String fullSigungu = buildFullSigungu(parsedAddress);

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

	private String buildFullSigungu(ParsedAddress parsedAddress) {
		if (parsedAddress.getDongRi() != null && !parsedAddress.getDongRi().isBlank()) {
			return parsedAddress.getSido() + " " + parsedAddress.getSigungu() + " " + parsedAddress.getDongRi();
		}
		return parsedAddress.getSido() + " " + parsedAddress.getSigungu();
	}

	private Optional<HousePriceResDto> findTradePriceResult(
		String houseType,
		String dbHouseType,
		String address,
		ParsedAddress parsedAddress
	) {
		Optional<HouseTradePrice> tradePrice = findExactTradePrice(dbHouseType, parsedAddress);
		if (tradePrice.isEmpty()) {
			return Optional.empty();
		}

		Long price = tradePrice.get().getDealAmountManwon();
		log.info("[HousePrice] 실거래가 조회 성공 - houseType: {}, address: {}, price: {}",
			houseType, address, price);

		return Optional.of(
			HousePriceResDto.builder()
				.price(price)
				.priceType("실거래가")
				.message("실거래가 기준으로 조회되었습니다.")
				.build()
		);
	}

	private Optional<HouseOfficialPrice> findExactOfficialPrice(ParsedAddress parsedAddress) {
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
		String houseType,
		String address,
		ParsedAddress parsedAddress
	) {
		Optional<HouseOfficialPrice> officialPrice = findExactOfficialPrice(parsedAddress);
		if (officialPrice.isEmpty()) {
			return Optional.empty();
		}

		Long price = officialPrice.get().getOfficialPrice() / 10000;
		log.info("[HousePrice] 공시가 조회 성공 - houseType: {}, address: {}, price: {}",
			houseType, address, price);

		return Optional.of(
			HousePriceResDto.builder()
				.price(price)
				.priceType("공시가")
				.message("공시가 기준으로 조회되었습니다.")
				.build()
		);
	}

	private Optional<Long> findEstimatedPriceValue(String dbHouseType, ParsedAddress parsedAddress) {
		String fullSigungu = buildFullSigungu(parsedAddress);

		// 1단계: 실거래 - 건물명 + 동 + 층 우선
		List<HouseTradePrice> tradeByDetail = houseTradePriceRepository.findLowestPricesByBuildingDetail(
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
		List<HouseTradePrice> tradeByBuilding = houseTradePriceRepository.findLowestPricesByBuilding(
			dbHouseType,
			fullSigungu,
			parsedAddress.getRoadName(),
			parsedAddress.getBuildingName()
		);
		if (!tradeByBuilding.isEmpty()) {
			return Optional.of(avgManwon(tradeByBuilding));
		}

		// 3단계: 공시가 - 단지명 + 동 + 호 우선
		List<HouseOfficialPrice> officialByDetail = houseOfficialPriceRepository.findLowestPricesByBuildingDetail(
			parsedAddress.getRoadAddress(),
			parsedAddress.getBuildingName(),
			parsedAddress.getBuildingDong(),
			parsedAddress.getHo()
		);
		if (!officialByDetail.isEmpty()) {
			return Optional.of(avgOfficial(officialByDetail));
		}

		// 4단계: 공시가 - 단지명까지만
		List<HouseOfficialPrice> officialByBuilding = houseOfficialPriceRepository.findLowestPricesByBuilding(
			parsedAddress.getRoadAddress(),
			parsedAddress.getBuildingName()
		);
		if (!officialByBuilding.isEmpty()) {
			return Optional.of(avgOfficial(officialByBuilding));
		}

		return Optional.empty();
	}

	private long avgManwon(List<HouseTradePrice> tradePrices) {
		double average = tradePrices.stream()
			.mapToLong(HouseTradePrice::getDealAmountManwon)
			.average()
			.orElse(0.0);
		return Math.round(average);
	}

	private long avgOfficial(List<HouseOfficialPrice> officialPrices) {
		double average = officialPrices.stream()
			.mapToLong(p -> p.getOfficialPrice() / 10000)
			.average()
			.orElse(0.0);
		return Math.round(average);
	}

	private Optional<HousePriceResDto> findEstimatedPriceResult(
		String houseType,
		String dbHouseType,
		String address,
		ParsedAddress parsedAddress
	) {
		Optional<Long> estimatedPrice = findEstimatedPriceValue(dbHouseType, parsedAddress);
		if (estimatedPrice.isEmpty()) {
			return Optional.empty();
		}

		Long price = estimatedPrice.get();
		log.info("[HousePrice] 근삿값 조회 성공 - houseType: {}, address: {}, price: {}",
			houseType, address, price);

		return Optional.of(
			HousePriceResDto.builder()
				.price(price)
				.priceType("근삿값")
				.message("같은 동의 낮은 주택가 평균값으로 조회되었습니다.")
				.build()
		);
	}
}
