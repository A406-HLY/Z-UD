package com.zud.backend.domain.document.service.facade;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.zud.backend.domain.document.dto.request.request.DocumentExtractionReqDto;
import com.zud.backend.domain.document.dto.response.DocumentExtractionDesDto;

public interface DocumentFacadeService {
	void uploadFiles(final List<MultipartFile> files, final String consultationId);

	DocumentExtractionDesDto validateDocuments(final DocumentExtractionReqDto reqDto);
}
