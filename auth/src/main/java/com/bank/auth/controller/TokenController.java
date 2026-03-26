package com.bank.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bank.auth.dto.request.TokenIssueReqDto;
import com.bank.auth.dto.request.TokenRefreshReqDto;
import com.bank.auth.dto.request.TokenRevokeReqDto;
import com.bank.auth.dto.response.TokenIssueResDto;
import com.bank.auth.service.TokenFacadeService;
import com.bank.common.response.BaseResponse;
import com.bank.common.util.ResponseUtils;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Tag(name = "토큰 (Token)", description = "JWT 토큰 발급/갱신/무효화 API (내부 서비스 전용)")
@RestController
@RequestMapping("/api/v1/token")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class TokenController {

	private final TokenFacadeService tokenFacadeService;

	@Operation(summary = "토큰 발급", description = "사용자 인증 완료 후 JWT Access/Refresh Token을 발급합니다.")
	@PostMapping("/issue")
	public ResponseEntity<BaseResponse<TokenIssueResDto>> issueToken(
		@Valid @RequestBody final TokenIssueReqDto reqDto,
		final HttpServletRequest httpServletRequest
	) {
		TokenIssueResDto response = tokenFacadeService.issueToken(reqDto, httpServletRequest);
		return ResponseUtils.created(response);
	}

	@Operation(summary = "토큰 갱신", description = "Refresh Token으로 새로운 Access Token을 발급합니다.")
	@PostMapping("/reissue")
	public ResponseEntity<BaseResponse<TokenIssueResDto>> reissueToken(
		@Valid @RequestBody final TokenRefreshReqDto reqDto,
		final HttpServletRequest httpServletRequest
	) {
		TokenIssueResDto response = tokenFacadeService.reissueAccessToken(reqDto, httpServletRequest);
		return ResponseUtils.ok(response);
	}

	@Operation(summary = "토큰 무효화", description = "Access Token을 블랙리스트에 등록하고 Refresh Token을 삭제합니다.")
	@PostMapping("/revoke")
	public ResponseEntity<BaseResponse<Void>> revokeToken(
		@Valid @RequestBody final TokenRevokeReqDto reqDto,
		final HttpServletRequest httpServletRequest
	) {
		tokenFacadeService.revokeToken(reqDto, httpServletRequest);
		return ResponseUtils.noContent();
	}

}
