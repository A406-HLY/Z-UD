package com.zud.backend.domain.houseprice.service.query;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;
import com.zud.backend.domain.houseprice.entity.HouseTradePrice;
import com.zud.backend.domain.houseprice.repository.HouseOfficialPriceRepository;
import com.zud.backend.domain.houseprice.repository.HouseTradePriceRepository;
import com.zud.backend.domain.houseprice.util.ParsedAddress;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class HousePriceQueryServiceImpl implements HousePriceQueryService {

	private final HouseTradePriceRepository houseTradePriceRepository;
	private final HouseOfficialPriceRepository houseOfficialPriceRepository;

	@Override
	public Optional<HouseTradePrice> findExactTradePrice(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
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

	@Override
	public Optional<HouseOfficialPrice> findExactOfficialPrice(final ParsedAddress parsedAddress) {
		return Optional.ofNullable(
			houseOfficialPriceRepository.findExactMatch(
				parsedAddress.getRoadAddress(),
				parsedAddress.getBuildingName(),
				parsedAddress.getBuildingDong(),
				parsedAddress.getHo()
			)
		);
	}

	@Override
	public List<HouseTradePrice> findLowestTradePricesByBuildingDetail(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
		final String fullSigungu = buildFullSigungu(parsedAddress);
		return houseTradePriceRepository.findLowestPricesByBuildingDetail(
			dbHouseType,
			fullSigungu,
			parsedAddress.getRoadName(),
			parsedAddress.getBuildingName(),
			parsedAddress.getBuildingDong(),
			parsedAddress.getFloor()
		);
	}

	@Override
	public List<HouseTradePrice> findLowestTradePricesByBuilding(
		final String dbHouseType,
		final ParsedAddress parsedAddress
	) {
		final String fullSigungu = buildFullSigungu(parsedAddress);
		return houseTradePriceRepository.findLowestPricesByBuilding(
			dbHouseType,
			fullSigungu,
			parsedAddress.getRoadName(),
			parsedAddress.getBuildingName()
		);
	}

	@Override
	public List<HouseOfficialPrice> findLowestOfficialPricesByBuildingDetail(
		final ParsedAddress parsedAddress
	) {
		return houseOfficialPriceRepository.findLowestPricesByBuildingDetail(
			parsedAddress.getRoadAddress(),
			parsedAddress.getBuildingName(),
			parsedAddress.getBuildingDong(),
			parsedAddress.getHo()
		);
	}

	@Override
	public List<HouseOfficialPrice> findLowestOfficialPricesByBuilding(
		final ParsedAddress parsedAddress
	) {
		return houseOfficialPriceRepository.findLowestPricesByBuilding(
			parsedAddress.getRoadAddress(),
			parsedAddress.getBuildingName()
		);
	}
}
