package com.zud.backend.domain.document.validator;

import java.util.List;

import com.zud.backend.domain.document.dto.request.content.DocumentContent;
import com.zud.backend.domain.document.enums.DocumentTag;

public interface DocumentContentValidator<T extends DocumentContent> {

	DocumentTag getSupportedTag();

	List<String> validate(T content);

	default List<String> validate(final T content, final ValidationContext context) {
		return validate(content);
	}
}
