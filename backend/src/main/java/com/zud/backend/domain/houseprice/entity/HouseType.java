package com.zud.backend.domain.houseprice.entity;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.houseprice.exception.HousePriceException;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum HouseType {

	APARTMENT("아파트", "APARTMENT"),
	MULTI_HOUSEHOLD("다세대연립", "MULTI_HOUSEHOLD"),
	SINGLE("단독", "SINGLE");

	private final String displayName;
	private final String dbCode;

	public static HouseType fromDisplayName(final String displayName) {
		for (final HouseType type : values()) {
			if (type.displayName.equals(displayName)) {
				return type;
			}
		}
		throw new HousePriceException(ErrorCode.INVALID_HOUSE_TYPE);
	}

	public static boolean isSupportedDisplayName(final String displayName) {
		for (final HouseType type : values()) {
			if (type.displayName.equals(displayName)) {
				return true;
			}
		}
		return false;
	}
}

