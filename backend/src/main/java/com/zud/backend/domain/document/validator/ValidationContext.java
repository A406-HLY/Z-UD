package com.zud.backend.domain.document.validator;

public record ValidationContext(
	String applicantName,
	String residentRegistrationNumber
) {
}
