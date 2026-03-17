package com.zud.backend.domain.houseprice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Schema(description = "주택 시세 조회 요청 DTO")
@Builder
public record HousePriceReqDto(
	@Schema(description = "주택 유형", example = "아파트", allowableValues = {"아파트", "다세대연립", "단독"})
	@NotBlank(message = "주택 유형은 필수입니다.")
	String houseType,

	@Schema(description = "주택 주소", example = "서울특별시 서초구 00동 1-1 00아파트 101동 101호")
	@NotBlank(message = "주택 주소는 필수입니다.")
	String address
) {
}
