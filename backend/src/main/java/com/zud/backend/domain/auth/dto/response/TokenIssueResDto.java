package com.zud.backend.domain.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonAlias;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(description = "인증 서버 토큰 발급 응답 DTO")
@Builder
public record TokenIssueResDto(
	@Schema(description = "Access Token", example = "eyJhbGciOiJSUzI1NiJ9...")
	@JsonAlias("access_token")
	String accessToken,
	@Schema(description = "Refresh Token", example = "eyJhbGciOiJSUzI1NiJ9...")
	@JsonAlias("refresh_token")
	String refreshToken,
	@Schema(description = "Access Token 만료 시간 (초)", example = "3600")
	@JsonAlias("expires_in")
	Long expiresIn,
	@Schema(description = "사용자 ID", example = "1")
	@JsonAlias("user_id")
	Long userId,
	@Schema(description = "사용자 이름", example = "홍길동")
	String name,
	@Schema(description = "사원 번호", example = "EMP001")
	@JsonAlias("employee_number")
	String employeeNumber,
	@Schema(description = "지점 ID", example = "1")
	@JsonAlias("branch_id")
	Long branchId
) {
}
