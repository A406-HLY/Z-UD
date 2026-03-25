package com.zud.backend.domain.report.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zud.backend.common.annotation.Authentication;
import com.zud.backend.common.config.swagger.ApiErrorResponse;
import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateResDto;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;
import com.zud.backend.domain.report.service.facade.ReportFacadeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "리포트 API", description = "대출 리포트 생성 및 조회 API")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ReportController {

	private final ReportFacadeService reportFacadeService;

	@PostMapping
	@Operation(summary = "대출 리포트 생성 요청", description = "입력 정보를 기반으로 대출 리포트 생성을 비동기로 요청한다.")
	@ApiErrorResponse
	public ResponseEntity<LoanReportGenerateResDto> generateReport(
		@Authentication Long userId,
		@RequestBody LoanReportReqDto request
	) {
		return ResponseEntity.ok(reportFacadeService.generateLoanReport(userId, request));
	}

	@GetMapping("/{consultationId}")
	@Operation(summary = "대출 리포트 결과 조회", description = "consultationId로 리포트 생성 결과를 조회한다.")
	@ApiErrorResponse
	public ResponseEntity<LoanReportResultResDto> getReportResult(
		@Parameter(description = "리포트 상담 ID")
		@PathVariable String consultationId
	) {
		return ResponseEntity.ok(reportFacadeService.getReportResult(consultationId));
	}
}
