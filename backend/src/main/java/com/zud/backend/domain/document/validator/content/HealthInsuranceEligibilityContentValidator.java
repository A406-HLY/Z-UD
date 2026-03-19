package com.zud.backend.domain.document.validator.content;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.dto.request.content.HealthInsuranceEligibilityContent;
import com.zud.backend.domain.document.enums.DocumentTag;
import com.zud.backend.domain.document.validator.DateValidator;
import com.zud.backend.domain.document.validator.DocumentContentValidator;

@Component
public class HealthInsuranceEligibilityContentValidator
	implements DocumentContentValidator<HealthInsuranceEligibilityContent> {

	private static final String REQUIRED_SUBSCRIBER_TYPE = "직장가입자";

	@Override
	public DocumentTag getSupportedTag() {
		return DocumentTag.FILE_005_HEALTH_INSURANCE_ELIGIBILITY;
	}

	@Override
	public List<String> validate(final HealthInsuranceEligibilityContent content) {
		List<String> invalidFields = new ArrayList<>();

		if (!isRequiredSubscriberType(content.subscriberType())) {
			invalidFields.add("subscriberType");
		}

		if (!DateValidator.isBeforeOrEqualToday(content.latestAcquisitionDate())) {
			invalidFields.add("latestAcquisitionDate");
		}

		if (hasLossDate(content.latestLossDate())) {
			invalidFields.add("latestLossDate");
		}

		return invalidFields;
	}

	private boolean isRequiredSubscriberType(final DataField<String> field) {
		return field != null && REQUIRED_SUBSCRIBER_TYPE.equals(field.value());
	}

	private boolean hasLossDate(final DataField<String> field) {
		return field != null && field.value() != null && !field.value().isBlank();
	}
}
