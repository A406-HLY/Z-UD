package com.zud.backend.domain.audit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Schema(description = "주택 심사 요청 DTO")
@Builder
public record AuditHouseReqDto(
	
	@Schema(description = "위반건축물 여부", example = "false")
	@NotNull(message = "위반건축물 여부는 필수입니다.")
	Boolean illegalBuilding,
	
	@Schema(
		description = "주택 유형",
		example = "아파트",
		allowableValues = {"아파트", "다세대연립", "단독"}
	)
	@NotBlank(message = "주택 유형은 필수입니다.")
	String houseType,

	@Schema(description = "심사 대상 주택 주소", example = "서울특별시 강남구 테헤란로 212")
	@NotBlank(message = "주택 주소는 필수입니다.")
	String propertyAddress

) {
}

