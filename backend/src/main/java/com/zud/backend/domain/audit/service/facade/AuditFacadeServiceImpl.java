package com.zud.backend.domain.audit.service.facade;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.audit.converter.AuditConverter;
import com.zud.backend.domain.audit.dto.request.AuditReqDto;
import com.zud.backend.domain.audit.dto.response.AuditResDto;
import com.zud.backend.domain.audit.exception.AuditException;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.service.facade.BranchFacadeService;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.entity.HouseType;
import com.zud.backend.domain.houseprice.service.facade.HousePriceFacadeService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Transactional(readOnly = true)
public class AuditFacadeServiceImpl implements AuditFacadeService {

	private static final String UNSUPPORTED_HOUSE_TYPE_MESSAGE =
		"해당 주택 유형은 주택담보대출 심사에서 통과하지 않을 수 있으며, 주택 시세 조회가 불가해 수기 입력이 필요합니다.";
	private static final String HOUSE_PRICE_MANUAL_INPUT_MESSAGE =
		"주택 시세 조회가 불가해 수기로 입력해주세요.";

	private final BranchFacadeService branchFacadeService;
	private final HousePriceFacadeService housePriceFacadeService;
	private final AuditConverter auditConverter;

	@Override
	public AuditResDto auditHouse(final Long userId, final AuditReqDto reqDto) {
		validateIllegalBuilding(reqDto);

		final String propertyAddress = reqDto.propertyAddress();
		final String houseType = reqDto.houseType();

		NearestBranchResDto nearestBranch = findNearestBranch(userId, propertyAddress);
		HousePriceAuditResult housePriceResult = evaluateHousePrice(houseType, propertyAddress);

		return auditConverter.toAuditResDto(
			false,
			nearestBranch,
			housePriceResult.supportedHouseType(),
			housePriceResult.housePrice()
		);
	}

	private void validateIllegalBuilding(final AuditReqDto reqDto) {
		if (Boolean.TRUE.equals(reqDto.illegalBuilding())) {
			throw new AuditException(ErrorCode.ILLEGAL_BUILDING);
		}
	}

	private NearestBranchResDto findNearestBranch(final Long userId, final String propertyAddress) {
		return branchFacadeService.findNearestBranch(userId, propertyAddress);
	}

	private HousePriceAuditResult evaluateHousePrice(final String houseType, final String propertyAddress) {
		boolean supportedHouseType = HouseType.isSupportedDisplayName(houseType);
		if (!supportedHouseType) {
			return new HousePriceAuditResult(false, createNullHousePrice(UNSUPPORTED_HOUSE_TYPE_MESSAGE));
		}

		HousePriceResDto housePrice = housePriceFacadeService.findHousePrice(houseType, propertyAddress);
		if (housePrice == null) {
			return new HousePriceAuditResult(true, createNullHousePrice(HOUSE_PRICE_MANUAL_INPUT_MESSAGE));
		}
		return new HousePriceAuditResult(true, housePrice);
	}

	private HousePriceResDto createNullHousePrice(final String message) {
		return HousePriceResDto.builder()
			.price(null)
			.priceType(null)
			.message(message)
			.build();
	}

	private record HousePriceAuditResult(
		boolean supportedHouseType,
		HousePriceResDto housePrice
	) {
	}
}

