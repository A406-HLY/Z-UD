package com.zud.backend.domain.audit.dto.response;

import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "심사 응답 DTO")
@Builder
public record AuditHouseResDto(
	@Schema(description = "위반건축물 여부")
	boolean illegalBuilding,

	@Schema(description = "가장 가까운 은행 지점 검사 결과")
	NearestBranchResDto nearestBranch,

	@Schema(description = "주택 시세 조회가 지원되는 주택 유형인지 여부")
	boolean supportedHouseType,

	@Schema(description = "주택 시세 조회 결과")
	HousePriceResDto housePrice
) {
}

