package com.zud.backend.domain.audit.dto.request;

import com.zud.backend.domain.branch.dto.request.NearestBranchReqDto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Schema(description = "심사 요청 DTO")
@Builder
public record AuditReqDto(
	@Schema(description = "가장 가까운 은행 지점 검사 요청")
	@NotNull(message = "nearestBranch는 필수입니다.")
	@Valid
	NearestBranchReqDto nearestBranch
) {
}

