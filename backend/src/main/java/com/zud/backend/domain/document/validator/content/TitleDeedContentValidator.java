package com.zud.backend.domain.document.validator.content;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.dto.request.content.TitleDeedContent;
import com.zud.backend.domain.document.enums.DocumentTag;
import com.zud.backend.domain.document.validator.DocumentContentValidator;

@Component
public class TitleDeedContentValidator implements DocumentContentValidator<TitleDeedContent> {

	@Override
	public DocumentTag getSupportedTag() {
		return DocumentTag.FILE_014_TITLE_DEED;
	}

	@Override
	public List<String> validate(final TitleDeedContent content) {
		List<String> invalidFields = new ArrayList<>();

		if (isTrueField(content.hasProvisionalRegistrationForOwnershipTransferClaim())) {
			invalidFields.add("hasProvisionalRegistrationForOwnershipTransferClaim");
		}

		if (isTrueField(content.hasTrustRegistration())) {
			invalidFields.add("hasTrustRegistration");
		}

		return invalidFields;
	}

	private boolean isTrueField(final DataField<Boolean> field) {
		return field != null && Boolean.TRUE.equals(field.value());
	}
}
