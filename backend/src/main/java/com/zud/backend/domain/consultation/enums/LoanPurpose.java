package com.zud.backend.domain.consultation.enums;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public enum LoanPurpose {
	HOME_PURCHASE("주택구매"),
	REFINANCE("융자"),
	JEONSE_DEPOSIT("전세금"),
	LIVING_STABILITY("주거안정"),
	OTHER("기타");

	private final String description;
}
