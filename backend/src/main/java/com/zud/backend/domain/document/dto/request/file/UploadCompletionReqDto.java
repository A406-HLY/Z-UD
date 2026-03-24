package com.zud.backend.domain.document.dto.request.file;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

@Schema(description = "파일 업로드 완료 요청 DTO")
public record UploadCompletionReqDto(
	@Valid
	@Schema(description = "업로드 결과 목록")
	@NotEmpty(message = "업로드된 파일 결과 목록은 비어있을 수 없습니다.")
	List<UploadResultDto> uploadedFiles
) {
}
