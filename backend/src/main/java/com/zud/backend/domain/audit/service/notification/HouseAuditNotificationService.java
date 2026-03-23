package com.zud.backend.domain.audit.service.notification;

import java.util.Map;
import java.util.function.Supplier;

import org.springframework.stereotype.Service;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.audit.dto.request.AuditHouseReqDto;
import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;
import com.zud.backend.domain.audit.enums.HouseAuditEventType;
import com.zud.backend.domain.audit.exception.AuditException;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.notification.dto.NotificationResDto;
import com.zud.backend.domain.notification.service.NotificationFacadeService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class HouseAuditNotificationService {

	private final NotificationFacadeService notificationFacadeService;

	public void notifyAuditStarted(final Long userId, final AuditHouseReqDto reqDto) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_STARTED, "주택 심사를 시작했습니다.",
			Map.of("houseType", reqDto.houseType(), "propertyAddress", reqDto.propertyAddress()));
	}

	public void notifyAuditCompleted(final Long userId, final AuditHouseResDto result) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_COMPLETED, "주택 심사가 완료되었습니다.", result);
	}

	public void notifyAuditFailed(final Long userId, final ErrorCode errorCode) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_FAILED, "주택 심사에 실패했습니다.",
			Map.of("errorCode", errorCode.name()));
	}

	public void notifyAuditFailed(final Long userId, final Exception ex) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_FAILED, "주택 심사 중 알 수 없는 오류가 발생했습니다.",
			Map.of("error", ex.getClass().getSimpleName()));
	}

	public void notifyIllegalBuildingCheckStarted(final Long userId) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_STARTED, "위반 건축물 검사를 시작했습니다.", null);
	}

	public void notifyIllegalBuildingCheckCompleted(final Long userId) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_COMPLETED, "위반 건축물 검사가 완료되었습니다.",
			Map.of("illegalBuilding", false));
	}

	public void notifyIllegalBuildingCheckFailed(final Long userId, final ErrorCode errorCode) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_FAILED, "위반 건축물 검사에서 실패했습니다.",
			Map.of("errorCode", errorCode.name()));
	}

	public void notifyNearestBranchCheckStarted(final Long userId) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_NEAREST_BRANCH_CHECK_STARTED, "가까운 은행 지점 검사를 시작했습니다.", null);
	}

	public void notifyNearestBranchCheckCompleted(final Long userId, final NearestBranchResDto nearestBranch) {
		send(
			userId,
			HouseAuditEventType.HOUSE_AUDIT_NEAREST_BRANCH_CHECK_COMPLETED,
			"가까운 은행 지점 검사가 완료되었습니다.",
			nearestBranch
		);
	}

	public void notifyNearestBranchCheckFailed(final Long userId, final Exception ex) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_NEAREST_BRANCH_CHECK_FAILED, "가까운 은행 지점 검사에서 실패했습니다.",
			Map.of("error", ex.getClass().getSimpleName()));
	}

	public void notifyPriceCheckStarted(final Long userId) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_PRICE_CHECK_STARTED, "주택 시세 조회를 시작했습니다.", null);
	}

	public void notifyPriceCheckCompleted(
		final Long userId,
		final boolean supportedHouseType,
		final HousePriceResDto housePrice
	) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_PRICE_CHECK_COMPLETED, "주택 시세 조회가 완료되었습니다.",
			Map.of("supportedHouseType", supportedHouseType, "housePrice", housePrice));
	}

	public void notifyPriceCheckFailed(final Long userId, final Exception ex) {
		send(userId, HouseAuditEventType.HOUSE_AUDIT_PRICE_CHECK_FAILED, "주택 시세 조회에서 실패했습니다.",
			Map.of("error", ex.getClass().getSimpleName()));
	}

	public void runIllegalBuildingCheckStep(final Long userId, final Runnable action) {
		notifyIllegalBuildingCheckStarted(userId);
		try {
			action.run();
			notifyIllegalBuildingCheckCompleted(userId);
		} catch (AuditException ex) {
			notifyIllegalBuildingCheckFailed(userId, ex.getErrorCode());
			throw ex;
		}
	}

	public <T> T runNearestBranchCheckStep(final Long userId, final Supplier<T> action) {
		notifyNearestBranchCheckStarted(userId);
		try {
			T result = action.get();
			if (result instanceof NearestBranchResDto nearestBranch) {
				notifyNearestBranchCheckCompleted(userId, nearestBranch);
			}
			return result;
		} catch (Exception ex) {
			notifyNearestBranchCheckFailed(userId, ex);
			throw ex;
		}
	}

	public <T> T runPriceCheckStep(
		final Long userId,
		final Supplier<T> action,
		final PriceStepCompletionHandler<T> completionHandler
	) {
		notifyPriceCheckStarted(userId);
		try {
			T result = action.get();
			completionHandler.onCompleted(userId, result);
			return result;
		} catch (Exception ex) {
			notifyPriceCheckFailed(userId, ex);
			throw ex;
		}
	}

	private void send(final Long userId, final HouseAuditEventType eventType, final String message, final Object data) {
		try {
			notificationFacadeService.send(userId, new NotificationResDto(eventType.name(), message, data));
		} catch (Exception ex) {
			log.warn("[HouseAuditSSE] 알림 전송 실패: userId={}, eventType={}, error={}",
				userId, eventType.name(), ex.getMessage());
		}
	}

	@FunctionalInterface
	public interface PriceStepCompletionHandler<T> {
		void onCompleted(Long userId, T result);
	}
}
