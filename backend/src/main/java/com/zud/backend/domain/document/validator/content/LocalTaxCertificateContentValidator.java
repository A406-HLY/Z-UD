package com.zud.backend.domain.document.validator.content;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.zud.backend.domain.document.constants.DocumentConstants;
import com.zud.backend.domain.document.dto.request.content.LocalTaxCertificateContent;
import com.zud.backend.domain.document.enums.DocumentTag;
import com.zud.backend.domain.document.validator.DateValidator;
import com.zud.backend.domain.document.validator.DocumentContentValidator;

@Component
public class LocalTaxCertificateContentValidator
	implements DocumentContentValidator<LocalTaxCertificateContent> {

	@Override
	public DocumentTag getSupportedTag() {
		return DocumentTag.FILE_012_LOCAL_TAX_CERTIFICATE;
	}

	@Override
	public List<String> validate(final LocalTaxCertificateContent content) {
		List<String> invalidFields = new ArrayList<>();

		if (DateValidator.isWithinDays(content.issueDate(),  DocumentConstants.VALID_DAYS)) {
			invalidFields.add("issueDate");
		}

		return invalidFields;
	}
}
