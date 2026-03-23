package com.zud.backend.domain.audit.service.facade;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.audit.converter.AuditConverter;
import com.zud.backend.domain.audit.dto.request.AuditHouseReqDto;
import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;
import com.zud.backend.domain.audit.exception.AuditException;
import com.zud.backend.domain.audit.service.notification.HouseAuditNotificationService;
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
public class AuditHouseFacadeServiceImpl implements AuditHouseFacadeService {

	private static final String UNSUPPORTED_HOUSE_TYPE_MESSAGE =
		"해당 주택 유형은 주택담보대출 심사에서 통과하지 않을 수 있으며, 주택 시세 조회가 불가해 수기 입력이 필요합니다.";
	private static final String HOUSE_PRICE_MANUAL_INPUT_MESSAGE =
		"주택 시세 조회가 불가해 수기로 입력해주세요.";

	private final BranchFacadeService branchFacadeService;
	private final HousePriceFacadeService housePriceFacadeService;
	private final HouseAuditNotificationService houseAuditNotificationService;

	@Override
	public AuditHouseResDto auditHouse(final Long userId, final AuditHouseReqDto reqDto) {
		houseAuditNotificationService.notifyAuditStarted(userId, reqDto);

		try {
			houseAuditNotificationService.runIllegalBuildingCheckStep(userId, () -> validateIllegalBuilding(reqDto));

			final String propertyAddress = reqDto.propertyAddress();
			final String houseType = reqDto.houseType();

			NearestBranchResDto nearestBranch = houseAuditNotificationService.runNearestBranchCheckStep(
				userId,
				() -> findNearestBranch(userId, propertyAddress)
			);

			HousePriceAuditResult housePriceResult = houseAuditNotificationService.runPriceCheckStep(
				userId,
				() -> evaluateHousePrice(houseType, propertyAddress),
				(stepUserId, result) -> houseAuditNotificationService.notifyPriceCheckCompleted(
					stepUserId,
					result.supportedHouseType(),
					result.housePrice()
				)
			);

			AuditHouseResDto result = AuditConverter.toAuditResDto(
				false,
				nearestBranch,
				housePriceResult.supportedHouseType(),
				housePriceResult.housePrice()
			);
			houseAuditNotificationService.notifyAuditCompleted(userId, result);
			return result;
		} catch (AuditException e) {
			houseAuditNotificationService.notifyAuditFailed(userId, e.getErrorCode());
			throw e;
		} catch (Exception e) {
			houseAuditNotificationService.notifyAuditFailed(userId, e);
			throw e;
		}
	}

	private void validateIllegalBuilding(final AuditHouseReqDto reqDto) {
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
			return new HousePriceAuditResult(
				false,
				AuditConverter.toUnavailableHousePrice(UNSUPPORTED_HOUSE_TYPE_MESSAGE)
			);
		}

		HousePriceResDto housePrice = housePriceFacadeService.findHousePrice(houseType, propertyAddress);
		if (housePrice == null) {
			return new HousePriceAuditResult(
				true,
				AuditConverter.toUnavailableHousePrice(HOUSE_PRICE_MANUAL_INPUT_MESSAGE)
			);
		}
		return new HousePriceAuditResult(true, housePrice);
	}

	private record HousePriceAuditResult(
		boolean supportedHouseType,
		HousePriceResDto housePrice
	) {
	}
}

