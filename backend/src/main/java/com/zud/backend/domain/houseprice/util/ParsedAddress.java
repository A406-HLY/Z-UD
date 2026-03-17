package com.zud.backend.domain.houseprice.util;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ParsedAddress {
	private final String sido;
	private final String sigungu;
	private final String dongRi;
	private final String roadAddress;
	private final String roadName;
	private final String buildingName;
	private final String buildingDong;
	private final String ho;
	private final Integer floor;
}
