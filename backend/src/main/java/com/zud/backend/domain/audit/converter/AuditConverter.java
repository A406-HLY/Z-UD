package com.zud.backend.domain.audit.converter;

import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class AuditConverter {

	public AuditHouseResDto toAuditResDto(
		final boolean illegalBuilding,
		final NearestBranchResDto nearestBranch,
		final boolean supportedHouseType,
		final HousePriceResDto housePrice
	) {
		return AuditHouseResDto.builder()
			.illegalBuilding(illegalBuilding)
			.nearestBranch(nearestBranch)
			.supportedHouseType(supportedHouseType)
			.housePrice(housePrice)
			.build();
	}

	public HousePriceResDto toUnavailableHousePrice(final String message) {
		return HousePriceResDto.builder()
			.price(null)
			.priceType(null)
			.message(message)
			.build();
	}
}

