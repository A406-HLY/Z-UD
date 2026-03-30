package com.zud.backend.domain.audit.enums;

public enum MyDataAuditEventType {
	MY_DATA_AUDIT_STARTED("마이데이터 심사를 시작했습니다."),
	MY_DATA_AUDIT_COMPLETED("마이데이터 심사가 완료되었습니다."),
	MY_DATA_AUDIT_FAILED("마이데이터 심사에 실패했습니다."),
	MY_DATA_MEMBER_LOOKUP_STARTED("회원 정보 조회를 시작했습니다."),
	MY_DATA_MEMBER_LOOKUP_COMPLETED("회원 정보 조회가 완료되었습니다."),
	MY_DATA_MEMBER_LOOKUP_FAILED("회원 정보 조회에 실패했습니다."),
	MY_DATA_CREDIT_RATING_LOOKUP_STARTED("신용등급 조회를 시작했습니다."),
	MY_DATA_CREDIT_RATING_LOOKUP_COMPLETED("신용등급 조회가 완료되었습니다."),
	MY_DATA_CREDIT_RATING_LOOKUP_FAILED("신용등급 조회에 실패했습니다."),
	MY_DATA_LOAN_PRODUCTS_LOOKUP_STARTED("대출 상품 조회를 시작했습니다."),
	MY_DATA_LOAN_PRODUCTS_LOOKUP_COMPLETED("대출 상품 조회가 완료되었습니다."),
	MY_DATA_LOAN_PRODUCTS_LOOKUP_FAILED("대출 상품 조회에 실패했습니다.");

	private final String defaultMessage;

	MyDataAuditEventType(final String defaultMessage) {
		this.defaultMessage = defaultMessage;
	}

	public String defaultMessage() {
		return defaultMessage;
	}
}
