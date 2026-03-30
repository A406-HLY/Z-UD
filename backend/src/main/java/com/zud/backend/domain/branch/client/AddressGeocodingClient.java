package com.zud.backend.domain.branch.client;

import com.zud.backend.domain.branch.client.dto.CoordinateResultDto;

public interface AddressGeocodingClient {
	CoordinateResultDto getCoordinates(String address);
}
