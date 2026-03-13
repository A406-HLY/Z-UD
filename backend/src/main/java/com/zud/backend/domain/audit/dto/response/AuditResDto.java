package com.zud.backend.domain.audit.dto.response;

import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "심사 응답 DTO")
@Builder
public record AuditResDto(
	@Schema(description = "가장 가까운 은행 지점 검사 결과")
	NearestBranchResDto nearestBranch
) {
}

