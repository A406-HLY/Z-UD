package com.zud.backend.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zud.backend.common.config.swagger.ApiErrorResponse;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.response.TokenIssueResDto;
import com.zud.backend.domain.auth.service.facade.AuthFacadeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Tag(name = "인증 (Auth)", description = "인증 관련 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthController {

	private final AuthFacadeService facadeService;

	@Operation(
		summary = "로그인",
		description = "사번과 비밀번호로 로그인합니다. 성공 시 Access Token은 Authorization 헤더, "
			+ "Refresh Token은 HttpOnly 쿠키로 전달됩니다.",
		security = @SecurityRequirement(name = ""),
		responses = @ApiResponse(
			responseCode = "200",
			description = "토큰 발급 성공",
			headers = @Header(name = "Authorization", description = "Bearer Access Token")
		)
	)
	@ApiErrorResponse
	@PostMapping("/login")
	public ResponseEntity<BaseResponse<TokenIssueResDto>> loginUser(
		@Valid @RequestBody final LoginReqDto reqDto,
		final HttpServletResponse servletResponse
	) {
		TokenIssueResDto response = facadeService.login(reqDto, servletResponse);
		return ResponseUtils.ok(response);
	}

	@Operation(
		summary = "토큰 재발급",
		description = "쿠키에 담긴 Refresh Token을 검증하여 Access Token을 재발급합니다."
			+ "성공 시 Access Token은 Authorization 헤더, Refresh Token은 HttpOnly 쿠키로 전달됩니다.",
		security = @SecurityRequirement(name = ""),
		responses = @ApiResponse(
			responseCode = "200",
			description = "토큰 재발급 성공",
			headers = @Header(name = "Authorization", description = "Bearer Access Token")
		)
	)
	@ApiErrorResponse
	@PostMapping("/reissue")
	public ResponseEntity<BaseResponse<TokenIssueResDto>> reissue(
		final HttpServletRequest servletRequest,
		final HttpServletResponse servletResponse
	) {
		TokenIssueResDto response = facadeService.reissue(servletRequest, servletResponse);
		return ResponseUtils.ok(response);
	}

	@Operation(
		summary = "로그아웃",
		description = "현재 Access Token을 무효화하고 Refresh Token 쿠키를 만료시킵니다.",
		responses = @ApiResponse(responseCode = "204", description = "로그아웃 성공")
	)
	@ApiErrorResponse
	@PostMapping("/logout")
	public ResponseEntity<BaseResponse<Void>> logoutUser(
		final HttpServletRequest servletRequest,
		final HttpServletResponse servletResponse
	) {
		facadeService.logout(servletRequest, servletResponse);
		return ResponseUtils.noContent();
	}
}
