package com.zud.backend.domain.document.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.common.config.swagger.ApiErrorResponse;
import com.zud.backend.common.response.BaseResponse;
import com.zud.backend.common.util.ResponseUtils;
import com.zud.backend.domain.document.dto.request.DocumentExtractionReqDto;
import com.zud.backend.domain.document.dto.request.file.PresignedUrlReqDto;
import com.zud.backend.domain.document.dto.request.file.UploadCompletionReqDto;
import com.zud.backend.domain.document.dto.response.DocumentExtractionDesDto;
import com.zud.backend.domain.document.dto.response.file.PresignedUrlResDto;
import com.zud.backend.domain.document.dto.response.file.UploadCompletionResDto;
import com.zud.backend.domain.document.service.facade.DocumentFacadeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
	@ApiErrorResponse
	public ResponseEntity<BaseResponse<Void>> uploadMultipleImage(
		@Schema(description = "업로드할 파일 목록")
		@RequestPart("multipartFile") List<MultipartFile> files,
		@Parameter(description = "상담 ID")
		@RequestParam("consultationId") String consultationId
	) {
		facadeService.uploadFiles(files, consultationId);
		return ResponseUtils.accepted();
	}

	@PostMapping("/extraction")
	@Operation(summary = "OCR 추출 결과 수신", description = "OCR 엔진으로부터 분석된 문서 데이터를 수신한다.")
	@ApiErrorResponse
	public ResponseEntity<BaseResponse<DocumentExtractionDesDto>> receiveExtractionResult(
		@Valid @RequestBody DocumentExtractionReqDto reqDto
	) {
		DocumentExtractionDesDto response = facadeService.validateDocuments(reqDto);
		return ResponseUtils.ok(response);
	}

	@PostMapping("/presigned-urls")
	@Operation(summary = "Presigned PUT URL 발급", description = "Cloudflare R2 직접 업로드를 위한 Presigned PUT URL을 발급한다.")
	@ApiErrorResponse
	public ResponseEntity<BaseResponse<PresignedUrlResDto>> issuePresignedUrls(
		@Valid @RequestBody PresignedUrlReqDto reqDto
	) {
		PresignedUrlResDto response = facadeService.issuePresignedUrls(reqDto);
		return ResponseUtils.ok(response);
	}

	@PostMapping("/upload-completions/{consultationId}")
	@Operation(summary = "파일 업로드 완료 신호", description = "클라이언트의 파일 업로드 완료를 수신하고 성공 파일에 대해 OCR 큐에 등록한다.")
	@ApiErrorResponse
	public ResponseEntity<BaseResponse<UploadCompletionResDto>> completeUpload(
		@Parameter(description = "상담 ID")
		@PathVariable String consultationId,
		@Valid @RequestBody UploadCompletionReqDto reqDto
	) {
		UploadCompletionResDto response = facadeService.completeUpload(consultationId, reqDto);
		return ResponseUtils.ok(response);
	}
}
