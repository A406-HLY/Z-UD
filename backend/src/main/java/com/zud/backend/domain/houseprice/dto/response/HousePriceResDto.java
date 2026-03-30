package com.zud.backend.domain.houseprice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "주택 시세 조회 응답 DTO")
@Builder
public record HousePriceResDto(
	@Schema(description = "주택 가격 (만원 단위)", example = "50000")
	Long price,

	@Schema(description = "가격 타입", example = "실거래가", allowableValues = {"실거래가", "공시가", "근삿값"})
	String priceType,

	@Schema(description = "조회 결과 메시지", example = "실거래가 기준으로 조회되었습니다.")
	String message
) {
}
