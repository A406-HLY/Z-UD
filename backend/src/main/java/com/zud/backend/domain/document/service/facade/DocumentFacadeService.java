package com.zud.backend.domain.document.service.facade;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface DocumentFacadeService {
	void uploadFiles(final List<MultipartFile> files, final Long userId, final Long counselId);
}
