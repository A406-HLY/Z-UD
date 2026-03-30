package com.zud.backend.domain.document.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrossField {

	LOAN_APPLICANT_NAME("name", "고객 성명"),
	RESIDENT_REGISTRATION_NUMBER("residentRegistrationNumber", "주민등록번호"),

	BUSINESS_NAME("businessName", "상호명"),
	BUSINESS_REGISTRATION_NUMBER("businessRegistrationNumber", "사업자등록번호"),

	TARGET_PROPERTY_OWNER_NAME("ownerName", "구매 대상 주택 소유자 성명");

	private final String fieldName;
	private final String description;
}
