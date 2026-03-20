package com.zud.backend.domain.document.validator.content;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.zud.backend.domain.document.dto.request.content.IncomeAmountCertificateContent;
import com.zud.backend.domain.document.enums.DocumentTag;
import com.zud.backend.domain.document.validator.DateValidator;
import com.zud.backend.domain.document.validator.DocumentContentValidator;

@Component
public class IncomeAmountCertificateContentValidator
	implements DocumentContentValidator<IncomeAmountCertificateContent> {

	@Override
	public DocumentTag getSupportedTag() {
		return DocumentTag.FILE_008_INCOME_AMOUNT_CERTIFICATE;
	}

	@Override
	public List<String> validate(final IncomeAmountCertificateContent content) {
		List<String> invalidFields = new ArrayList<>();

		if (!DateValidator.isWithinYears(content.issueDate(), 1)) {
			invalidFields.add("issueDate");
		}

		return invalidFields;
	}
}
