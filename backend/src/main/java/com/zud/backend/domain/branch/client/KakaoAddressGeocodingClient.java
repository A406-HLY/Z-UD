package com.zud.backend.domain.branch.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.branch.client.dto.CoordinateResultDto;
import com.zud.backend.domain.branch.client.dto.KakaoAddressResDto;
import com.zud.backend.domain.branch.exception.BranchException;

@Component
public class KakaoAddressGeocodingClient implements AddressGeocodingClient {

	private final RestClient restClient;
	private final String kakaoApiKey;

	public KakaoAddressGeocodingClient(
		@Value("${kakao.api.key}")
		String kakaoApiKey
	) {
		this.restClient = RestClient.builder()
			.baseUrl("https://dapi.kakao.com")
			.build();
		this.kakaoApiKey = kakaoApiKey;
	}

	@Override
	public CoordinateResultDto getCoordinates(String address) {
		KakaoAddressResDto res = restClient.get()
			.uri(uriBuilder -> uriBuilder
				.path("/v2/local/search/address.json")
				.queryParam("query", address)
				.build())
			.header("Authorization", "KakaoAK " + kakaoApiKey)
			.retrieve()
			.body(KakaoAddressResDto.class);

		if(res == null || res.documents() == null || res.documents().isEmpty()) {
			throw new BranchException(ErrorCode.ADDRESS_COORDINATE_NOT_FOUND);
		}

		KakaoAddressResDto.Document document = res.documents().get(0);

		return new CoordinateResultDto(
			Double.parseDouble(document.y()),
			Double.parseDouble(document.x())
		);
	}
}
