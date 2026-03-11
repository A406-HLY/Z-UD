package com.zud.backend.domain.auth.dto.response;

import com.zud.backend.domain.user.dto.common.BranchInfoDto;
import com.zud.backend.domain.user.dto.common.UserInfoDto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "로그인 성공 응답 DTO")
@Builder
public record LoginSuccessResDto(
	@Schema(description = "사용자 정보")
	UserInfoDto userInfoDto,
	@Schema(description = "지점 정보")
	BranchInfoDto branchInfoDto,
	@Schema(description = "세션 만료 시간 (ISO 8601)", example = "2026-03-11T21:00:00+09:00")
	String sessionExpiry
) {
}
