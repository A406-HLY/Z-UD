package com.zud.backend.domain.audit.converter;

import com.zud.backend.domain.audit.dto.response.AuditResDto;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;

import lombok.experimental.UtilityClass;

@UtilityClass
public class AuditConverter {

	public AuditResDto toAuditResDto(
		final boolean illegalBuilding,
		final NearestBranchResDto nearestBranch,
		final boolean supportedHouseType,
		final HousePriceResDto housePrice
	) {
		return AuditResDto.builder()
			.illegalBuilding(illegalBuilding)
			.nearestBranch(nearestBranch)
			.supportedHouseType(supportedHouseType)
			.housePrice(housePrice)
			.build();
	}
}

