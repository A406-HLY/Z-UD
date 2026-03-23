package com.zud.backend.domain.audit.service.notification;

import java.util.Map;
import java.util.function.Supplier;

import org.springframework.stereotype.Service;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.audit.dto.request.MyDataReqDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;
import com.zud.backend.domain.audit.enums.MyDataAuditEventType;
import com.zud.backend.domain.notification.dto.NotificationResDto;
import com.zud.backend.domain.notification.service.NotificationFacadeService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class MyDataAuditNotificationService {

	private final NotificationFacadeService notificationFacadeService;

	public void notifyMyDataAuditStarted(final Long userId, final MyDataReqDto reqDto) {
		send(
			userId,
			MyDataAuditEventType.MY_DATA_AUDIT_STARTED,
			Map.of("customerName", reqDto.customerName())
		);
	}

	public void notifyMyDataAuditCompleted(final Long userId, final MyDataResDto result) {
		send(userId, MyDataAuditEventType.MY_DATA_AUDIT_COMPLETED, result);
	}

	public void notifyMyDataAuditFailed(final Long userId, final ErrorCode errorCode) {
		send(
			userId,
			MyDataAuditEventType.MY_DATA_AUDIT_FAILED,
			Map.of("errorCode", errorCode.name())
		);
	}

	public void notifyMyDataAuditFailed(final Long userId, final Exception ex) {
		send(
			userId,
			MyDataAuditEventType.MY_DATA_AUDIT_FAILED,
			"마이데이터 심사 중 알 수 없는 오류가 발생했습니다.",
			Map.of("error", ex.getClass().getSimpleName())
		);
	}

	public <T> T runMemberLookupStep(final Long userId, final Supplier<T> action) {
		send(userId, MyDataAuditEventType.MY_DATA_MEMBER_LOOKUP_STARTED, null);
		try {
			T result = action.get();
			send(userId, MyDataAuditEventType.MY_DATA_MEMBER_LOOKUP_COMPLETED, result);
			return result;
		} catch (Exception ex) {
			send(
				userId,
				MyDataAuditEventType.MY_DATA_MEMBER_LOOKUP_FAILED,
				Map.of("error", ex.getClass().getSimpleName())
			);
			throw ex;
		}
	}

	public <T> T runCreditRatingLookupStep(final Long userId, final Supplier<T> action) {
		send(userId, MyDataAuditEventType.MY_DATA_CREDIT_RATING_LOOKUP_STARTED, null);
		try {
			T result = action.get();
			send(userId, MyDataAuditEventType.MY_DATA_CREDIT_RATING_LOOKUP_COMPLETED, result);
			return result;
		} catch (Exception ex) {
			send(
				userId,
				MyDataAuditEventType.MY_DATA_CREDIT_RATING_LOOKUP_FAILED,
				Map.of("error", ex.getClass().getSimpleName())
			);
			throw ex;
		}
	}

	public <T> T runLoanProductsLookupStep(final Long userId, final Supplier<T> action) {
		send(
			userId,
			MyDataAuditEventType.MY_DATA_LOAN_PRODUCTS_LOOKUP_STARTED,
			null
		);
		try {
			T result = action.get();
			send(
				userId,
				MyDataAuditEventType.MY_DATA_LOAN_PRODUCTS_LOOKUP_COMPLETED,
				result
			);
			return result;
		} catch (Exception ex) {
			send(
				userId,
				MyDataAuditEventType.MY_DATA_LOAN_PRODUCTS_LOOKUP_FAILED,
				Map.of("error", ex.getClass().getSimpleName())
			);
			throw ex;
		}
	}

	private void send(final Long userId, final MyDataAuditEventType eventType, final Object data) {
		send(userId, eventType, eventType.defaultMessage(), data);
	}

	private void send(
		final Long userId,
		final MyDataAuditEventType eventType,
		final String message,
		final Object data
	) {
		try {
			notificationFacadeService.send(userId, new NotificationResDto(eventType.name(), message, data));
		} catch (Exception ex) {
			log.warn(
				"[MyDataAuditSSE] 알림 전송 실패: userId={}, eventType={}, error={}",
				userId,
				eventType.name(),
				ex.getMessage()
			);
		}
	}
}
