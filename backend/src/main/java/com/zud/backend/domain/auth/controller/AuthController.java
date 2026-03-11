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
import com.zud.backend.domain.auth.dto.response.LoginSuccessResDto;
import com.zud.backend.domain.auth.service.facade.AuthFacadeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Tag(name = "인증 (Auth)", description = "로그인/로그아웃 등 인증 관련 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthController {

	private final AuthFacadeService facadeService;

	@Operation(
		summary = "로그인",
		description = "사번과 비밀번호로 로그인합니다. 성공 시 세션 쿠키(`ZUD_SESSION`)가 응답에 설정됩니다.",
		security = @SecurityRequirement(name = "")
	)
	@ApiErrorResponse
	@PostMapping("/login")
	public ResponseEntity<BaseResponse<LoginSuccessResDto>> loginUser(
		@Valid @RequestBody final LoginReqDto reqDto,
		final HttpServletResponse servletResponse
	) {
		LoginSuccessResDto response = facadeService.login(reqDto, servletResponse);
		return ResponseUtils.ok(response);
	}

}
