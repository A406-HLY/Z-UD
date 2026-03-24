package com.zud.backend.domain.report.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zud.backend.domain.report.dto.request.LoanReportReqDto;
import com.zud.backend.domain.report.dto.response.LoanReportGenerateRes;
import com.zud.backend.domain.report.dto.response.LoanReportResultResDto;
import com.zud.backend.domain.report.service.facade.ReportFacadeService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Validated
public class ReportController {

	private final ReportFacadeService reportFacadeService;

	@PostMapping
	public ResponseEntity<LoanReportGenerateRes> generateReport(
		@Valid @RequestBody LoanReportReqDto request
	) {
		return ResponseEntity.ok(reportFacadeService.generateLoanReport(request));
	}

	@GetMapping("/{uuid}")
	public ResponseEntity<LoanReportResultResDto> getReportResult(@PathVariable String uuid) {
		return ResponseEntity.ok(reportFacadeService.getReportResult(uuid));
	}
}
