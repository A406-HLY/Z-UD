package com.zud.backend.domain.auth.dto.response;

import com.zud.backend.domain.user.dto.common.BranchInfoDto;
import com.zud.backend.domain.user.dto.common.UserInfoDto;

import lombok.Builder;

@Builder
public record LoginSuccessResDto(
	UserInfoDto userInfoDto,
	BranchInfoDto branchInfoDto,
	String sessionExpiry
) {
}
