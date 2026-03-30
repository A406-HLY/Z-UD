package com.zud.backend.domain.auth.dto.response;

import com.zud.backend.domain.user.dto.common.BranchInfoDto;
import com.zud.backend.domain.user.dto.common.UserInfoDto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "토큰 발급 성공 응답 DTO")
@Builder
public record TokenIssueResDto(
	@Schema(description = "사용자 정보 (userId, name)")
	UserInfoDto userInfoDto,
	@Schema(description = "지점 정보")
	BranchInfoDto branchInfoDto,
	@Schema(description = "Access Token 만료 시간 (초), 실제 Access Token은 Authorization 헤더로 전달")
	Long expiresIn
) {
}
