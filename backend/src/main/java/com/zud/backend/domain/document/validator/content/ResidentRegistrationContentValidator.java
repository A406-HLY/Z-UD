package com.zud.backend.domain.document.validator.content;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Component;

import com.zud.backend.domain.document.dto.request.content.ResidentRegistrationContent;
import com.zud.backend.domain.document.enums.DocumentTag;
import com.zud.backend.domain.document.validator.DocumentContentValidator;
import com.zud.backend.domain.document.validator.ValidationContext;

import io.micrometer.common.util.StringUtils;

@Component
public class ResidentRegistrationContentValidator implements DocumentContentValidator<ResidentRegistrationContent> {
	@Override
	public DocumentTag getSupportedTag() {
		return DocumentTag.FILE_001_RESIDENT_REGISTRATION;
	}

	@Override
	public List<String> validate(final ResidentRegistrationContent content) {
		return validate(content, new ValidationContext(null, null));
	}

	@Override
	public List<String> validate(final ResidentRegistrationContent content, final ValidationContext context) {
		List<String> invalidFields = new ArrayList<>();
		String applicantName = context != null ? context.applicantName() : null;

		boolean exists = !StringUtils.isEmpty(applicantName)
			&& content.householdMembers() != null
			&& containsApplicant(content, applicantName);

		if (!exists) {
			invalidFields.add("householdMembers.name");
		}

		return invalidFields;
	}

	private boolean containsApplicant(final ResidentRegistrationContent content, final String applicantName) {
		return content.householdMembers().stream()
			.map(ResidentRegistrationContent.HouseholdMember::name)
			.filter(Objects::nonNull)
			.map(com.zud.backend.common.dto.common.DataField::value)
			.filter(Objects::nonNull)
			.anyMatch(name -> name.trim().equals(applicantName.trim()));
	}

}
