package com.zud.backend.domain.audit.enums;

public enum HouseAuditEventType {
	HOUSE_AUDIT_STARTED("주택 심사를 시작했습니다."),
	HOUSE_AUDIT_COMPLETED("주택 심사가 완료되었습니다."),
	HOUSE_AUDIT_FAILED("주택 심사에 실패했습니다."),
	HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_STARTED("위반 건축물 검사를 시작했습니다."),
	HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_COMPLETED("위반 건축물 검사가 완료되었습니다."),
	HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_FAILED("위반 건축물 검사에서 실패했습니다."),
	HOUSE_AUDIT_NEAREST_BRANCH_CHECK_STARTED("가까운 은행 지점 검사를 시작했습니다."),
	HOUSE_AUDIT_NEAREST_BRANCH_CHECK_COMPLETED("가까운 은행 지점 검사가 완료되었습니다."),
	HOUSE_AUDIT_NEAREST_BRANCH_CHECK_FAILED("가까운 은행 지점 검사에서 실패했습니다."),
	HOUSE_AUDIT_PRICE_CHECK_STARTED("주택 시세 조회를 시작했습니다."),
	HOUSE_AUDIT_PRICE_CHECK_COMPLETED("주택 시세 조회가 완료되었습니다."),
	HOUSE_AUDIT_PRICE_CHECK_FAILED("주택 시세 조회에서 실패했습니다.");

	private final String defaultMessage;

	HouseAuditEventType(final String defaultMessage) {
		this.defaultMessage = defaultMessage;
	}

	public String defaultMessage() {
		return defaultMessage;
	}
}
