package com.zud.backend.domain.document.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.document.service.facade.DocumentFacadeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/documents")
@Tag(name = "문서 API", description = "문서 관련 API")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentController {

	private final DocumentFacadeService facadeService;

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	@Operation(summary = "다중 파일 업로드", description = "여러개의 파일을 CloudFlare에 비동기로 업로드한다.")
	public ResponseEntity<BaseResponse<Void>> uploadMultipleImage(
		@Schema(description = "업로드할 파일 목록")
		@RequestPart("multipartFile") List<MultipartFile> files,
		@Parameter(description = "상담 ID")
		@RequestParam("counselId") String counselId
	) {
		facadeService.uploadFiles(files, counselId);
		return ResponseUtils.accepted();
	}
}
