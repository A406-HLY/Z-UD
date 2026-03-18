package com.zud.backend.domain.consultation.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public enum EmploymentType {
	EMPLOYEE("근로자"),
	SELF_EMPLOYED("개인 사업자");

	private final String description;
}
