package com.zud.backend.domain.branch.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "가장 가까운 은행 지점 조회 응답 DTO")
@Builder
public record NearestBranchResDto(

	@Schema(description = "현재 로그인한 사용자의 지점이 가장 가까운 지점인지 여부", example = "false")
	boolean currentBranchIsNearest,

	@Schema(description = "현재 로그인한 사용자의 지점명", example = "서초지점")
	String currentBranchName,

	@Schema(description = "현재 로그인한 사용자의 지점 주소", example = "서울특별시 서초구 서초대로 123")
	String currentBranchAddress,

	@Schema(description = "현재 로그인한 사용자의 지점과 건물 사이 거리(m)", example = "923.15")
	double currentBranchDistanceMeter,

	@Schema(description = "건물과 가장 가까운 은행 지점명", example = "강남지점")
	String nearestBranchName,

	@Schema(description = "건물과 가장 가까운 은행 지점 주소", example = "서울특별시 강남구 테헤란로 123")
	String nearestBranchAddress,

	@Schema(description = "건물과 가장 가까운 은행 지점까지의 거리(m)", example = "210.42")
	double nearestBranchDistanceMeter,

	@Schema(description = "조회 결과 메시지", example = "현재 근무 지점은 해당 건물과 가장 가까운 지점이 아닙니다.")
	String message
) {
}
