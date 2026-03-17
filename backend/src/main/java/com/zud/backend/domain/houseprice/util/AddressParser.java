package com.zud.backend.domain.houseprice.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class AddressParser {

	public static ParsedAddress parse(final String address) {
		if (address == null || address.isBlank()) {
			throw new IllegalArgumentException("주소가 비어있습니다.");
		}

		final String[] tokens = address.trim().split("\\s+");
		if (tokens.length < 4) {
			throw new IllegalArgumentException("주소 형식이 올바르지 않습니다: " + address);
		}

		final String sido = tokens[0];
		final String sigungu = tokens[1];

		int idx = 2;
		String dongRi = null;
		if (tokens[idx].endsWith("동") || tokens[idx].endsWith("리")) {
			dongRi = tokens[idx];
			idx++;
		}

		if (idx >= tokens.length) {
			throw new IllegalArgumentException("주소 형식이 올바르지 않습니다: " + address);
		}

		// 도로명 + 번호 (예: "자하문로36길" "16-14", "천사로" "130")
		if (!tokens[idx].contains("로") && !tokens[idx].contains("길")) {
			throw new IllegalArgumentException("주소 형식이 올바르지 않습니다: " + address);
		}
		final String roadNameToken = tokens[idx++];
		if (idx >= tokens.length) {
			throw new IllegalArgumentException("주소 형식이 올바르지 않습니다: " + address);
		}
		final String roadNumberToken = tokens[idx++];
		final String roadName = roadNameToken + " " + roadNumberToken;

		// 나머지: 건물이름 + [동] + [층] + [호]
		String buildingName = null;
		String buildingDong = null;
		Integer floor = null;
		String ho = null;

		// 동/층/호 후보는 끝에서부터 확인
		int end = tokens.length - 1;
		if (tokens[end].endsWith("호")) {
			ho = tokens[end].replace("호", "").trim();
			end--;
		}
		if (end >= idx && tokens[end].endsWith("층")) {
			String digitsOnly = tokens[end].replaceAll("\\D+", "");
			if (!digitsOnly.isEmpty()) {
				try {
					floor = Integer.parseInt(digitsOnly);
				} catch (NumberFormatException ignored) {
					floor = null;
				}
			}
			end--;
		}
		if (end >= idx && tokens[end].endsWith("동")) {
			buildingDong = tokens[end].replace("동", "").trim();
			end--;
		}

		if (end < idx) {
			throw new IllegalArgumentException("건물명 정보를 찾을 수 없습니다: " + address);
		}

		final StringBuilder buildingNameBuilder = new StringBuilder();
		for (int i = idx; i <= end; i++) {
			if (i > idx) {
				buildingNameBuilder.append(' ');
			}
			buildingNameBuilder.append(tokens[i]);
		}
		buildingName = buildingNameBuilder.toString();

		final String fullRoadAddress;
		if (dongRi != null) {
			fullRoadAddress = String.join(" ", sido, sigungu, dongRi, roadName);
		} else {
			fullRoadAddress = String.join(" ", sido, sigungu, roadName);
		}

		return ParsedAddress.builder()
			.sido(sido)
			.sigungu(sigungu)
			.dongRi(dongRi)
			.roadAddress(fullRoadAddress)
			.roadName(roadName)
			.buildingName(buildingName)
			.buildingDong(buildingDong)
			.ho(ho)
			.floor(floor)
			.build();
	}
}
