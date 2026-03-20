package com.zud.backend.domain.consultation.service;

import java.util.List;

import com.zud.backend.domain.consultation.enums.CounselStatus;

public interface ConsultationStatusService {
	void updateDocumentVerificationStatus(String dirName, CounselStatus status, List<String> uploadedUrls);

	void deleteStatus(String dirName);
}
