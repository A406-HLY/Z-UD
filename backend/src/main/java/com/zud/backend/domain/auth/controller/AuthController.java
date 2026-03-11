package com.zud.backend.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.auth.dto.request.LoginReqDto;
import com.zud.backend.domain.auth.dto.response.LoginSuccessResDto;
import com.zud.backend.domain.auth.service.facade.AuthFacadeService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthController {

	private final AuthFacadeService facadeService;

	@PostMapping("/login")
	public ResponseEntity<BaseResponse<LoginSuccessResDto>> loginUser(
		@Valid @RequestBody final LoginReqDto reqDto,
		final HttpServletResponse servletResponse
	) {
		LoginSuccessResDto response = facadeService.login(reqDto, servletResponse);
		return ResponseUtils.ok(response);
	}

}
