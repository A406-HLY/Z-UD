package com.zud.backend.domain.document.service.facade;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.domain.document.dto.request.DocumentExtractionReqDto;
import com.zud.backend.domain.document.dto.request.file.PresignedUrlReqDto;
import com.zud.backend.domain.document.dto.request.file.UploadCompletionReqDto;
import com.zud.backend.domain.document.dto.response.DocumentExtractionResDto;
import com.zud.backend.domain.document.dto.response.file.PresignedUrlResDto;
import com.zud.backend.domain.document.dto.response.file.UploadCompletionResDto;

public interface DocumentFacadeService {
	void uploadFiles(final List<MultipartFile> files, final String consultationId);

	DocumentExtractionResDto validateDocuments(final DocumentExtractionReqDto reqDto);

	DocumentExtractionResDto getExtractionResult(final String consultationId);

	PresignedUrlResDto issuePresignedUrls(final PresignedUrlReqDto reqDto);

	UploadCompletionResDto completeUpload(final String consultationId, final UploadCompletionReqDto reqDto);

	void updateRuleDocuments(final List<MultipartFile> files, final String fileName);
}
