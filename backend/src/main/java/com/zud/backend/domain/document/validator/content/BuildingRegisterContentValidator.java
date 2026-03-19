package com.zud.backend.domain.document.validator.content;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.dto.request.content.BuildingRegisterContent;
import com.zud.backend.domain.document.enums.DocumentTag;
import com.zud.backend.domain.document.validator.DocumentContentValidator;

@Component
public class BuildingRegisterContentValidator implements DocumentContentValidator<BuildingRegisterContent> {

	@Override
	public DocumentTag getSupportedTag() {
		return DocumentTag.FILE_015_BUILDING_REGISTER;
	}

	@Override
	public List<String> validate(final BuildingRegisterContent content) {
		List<String> invalidFields = new ArrayList<>();

		if (isViolationBuilding(content.isViolationBuilding())) {
			invalidFields.add("isViolationBuilding");
		}

		return invalidFields;
	}

	private boolean isViolationBuilding(final DataField<Boolean> field) {
		return field != null && Boolean.TRUE.equals(field.value());
	}
}
