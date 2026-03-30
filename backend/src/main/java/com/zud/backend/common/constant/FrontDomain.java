package com.zud.backend.common.constant;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public enum FrontDomain {

	LOCAL("http://localhost:3000", "프론트 로컬 도메인"),
	AGENT("http://localhost:4000", "에이전트 도메인");

	private final String url;
	private final String description;
}