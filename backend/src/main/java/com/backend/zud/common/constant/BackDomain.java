package com.backend.zud.common.constant;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public enum BackDomain {

	LOCAL("http://localhost:8080", "백엔드 로컬 도메인"),
	PROD("https://j14a406.p.ssafy.io", "백엔드 배포 도메인");

	private final String url;
	private final String description;
}