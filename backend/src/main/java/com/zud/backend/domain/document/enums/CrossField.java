package com.zud.backend.domain.document.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrossField {

	CUSTOMER_NAME("name", "고객 성명"),
	REPRESENTATIVE_NAME("representativeName", "대표자 성명"),
	BUSINESS_NAME("businessName", "상호명"),
	BUSINESS_REGISTRATION_NUMBER("businessRegistrationNumber", "사업자등록번호"),
	RESIDENT_REGISTRATION_NUMBER("residentRegistrationNumber", "주민등록번호");

	private final String fieldName;
	private final String description;
}
