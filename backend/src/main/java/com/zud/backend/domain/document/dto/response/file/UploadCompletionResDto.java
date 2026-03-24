package com.zud.backend.domain.document.dto.response.file;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "업로드 완료 처리 응답 DTO")
public record UploadCompletionResDto(
	@Schema(description = "상담 ID", example = "290b84d9-657e-4341-8b84-d9657e434133")
	String consultationId,
	@Schema(description = "처리 상태", example = "SUCCESS")
	String status,
	@Schema(description = "성공 개수", example = "3")
	int successCount,
	@Schema(description = "실패한 파일명 목록")
	List<String> failedFiles
) {
}
