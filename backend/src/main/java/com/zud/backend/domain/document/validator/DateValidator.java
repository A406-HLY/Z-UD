package com.zud.backend.domain.document.validator;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

import com.zud.backend.common.dto.common.DataField;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DateValidator {

	private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
		DateTimeFormatter.ofPattern("yyyy-MM-dd"),
		DateTimeFormatter.ofPattern("yyyy.MM.dd"),
		DateTimeFormatter.ofPattern("yyyyMMdd"),
		DateTimeFormatter.ofPattern("yyyy/MM/dd")
	);

	public boolean isWithinDays(final DataField<String> dateField, final long days) {
		LocalDate date = parseDate(dateField);
		if (date == null) {
			return true;
		}
		return date.isBefore(LocalDate.now().minusDays(days));
	}

	public boolean isWithinYears(final DataField<String> dateField, final long years) {
		LocalDate date = parseDate(dateField);
		if (date == null) {
			return false;
		}
		return !date.isBefore(LocalDate.now().minusYears(years));
	}

	public boolean isBeforeOrEqualToday(final DataField<String> dateField) {
		LocalDate date = parseDate(dateField);
		if (date == null) {
			return false;
		}
		return !date.isAfter(LocalDate.now());
	}

	private LocalDate parseDate(final DataField<String> dateField) {
		if (dateField == null || dateField.value() == null || dateField.value().isBlank()) {
			return null;
		}

		String value = dateField.value().trim();
		for (DateTimeFormatter formatter : DATE_FORMATTERS) {
			try {
				return LocalDate.parse(value, formatter);
			} catch (DateTimeParseException _) {
				// 현재 포맷과 불일치 — 다음 포맷 시도
			}
		}
		return null;
	}
}
