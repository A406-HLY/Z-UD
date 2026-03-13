package com.zud.backend.domain.branch.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zud.backend.common.annotation.Authentication;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.branch.dto.request.NearestBranchReqDto;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.service.facade.BranchFacadeServiceImpl;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@Tag(name = "은행 지점 (branch)", description = "은행점 관련 API")
@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class BranchController {
	private final BranchFacadeServiceImpl branchFacadeServiceImpl;

	@PostMapping("/nearest")
	public ResponseEntity<BaseResponse<NearestBranchResDto>> nearest(
		@Authentication Long userId,
		@Valid @RequestBody NearestBranchReqDto reqDto
	) {
		NearestBranchResDto response = branchFacadeServiceImpl.findNearestBranch(
			userId,
			reqDto);
		return ResponseUtils.ok(response);
	}
}
