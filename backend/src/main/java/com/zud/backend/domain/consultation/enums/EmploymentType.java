package com.zud.backend.domain.consultation.enums;

import java.util.List;

import com.zud.backend.domain.document.enums.DocumentTag;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public enum EmploymentType {
	EMPLOYEE("근로자", List.of(DocumentTag.FILE_006_WITHHOLDING_TAX_CERTIFICATE)),
	SELF_EMPLOYED("개인 사업자", List.of(DocumentTag.FILE_008_INCOME_AMOUNT_CERTIFICATE));

	private final String description;
	private final List<DocumentTag> requiredDocumentTags;
}
