package com.zud.backend.domain.branch.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Schema(description = "가장 가까운 은행 지점 조회 요청 DTO")
@Builder
public record NearestBranchReqDto(
	@Schema(description = "기준이 되는 건물 주소", example = "서울특별시 강남구 테헤란로 212")
	@NotBlank(message = "주택 주소는 필수입니다.")
	String address
) {
}
