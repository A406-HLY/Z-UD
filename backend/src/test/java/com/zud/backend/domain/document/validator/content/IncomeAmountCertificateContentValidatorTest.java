package com.zud.backend.domain.document.validator.content;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.dto.request.content.IncomeAmountCertificateContent;
import com.zud.backend.domain.document.enums.DocumentTag;

@DisplayName("IncomeAmountCertificateContentValidator 단위 테스트")
class IncomeAmountCertificateContentValidatorTest {

	private final IncomeAmountCertificateContentValidator validator =
		new IncomeAmountCertificateContentValidator();

	private DataField<String> strField(String value) {
		return new DataField<>(value, null, null);
	}

	@Test
	@DisplayName("getSupportedTag는_File_008_반환")
	void getSupportedTag는_File_008_반환() {
		assertThat(validator.getSupportedTag())
			.isEqualTo(DocumentTag.FILE_008_INCOME_AMOUNT_CERTIFICATE);
	}

	@Nested
	@DisplayName("validate()")
	class Validate {

		@Test
		@DisplayName("발급일이_1년_이내면_빈_리스트_반환")
		void 발급일이_1년_이내면_빈_리스트_반환() {
			// given
			String recentDate = LocalDate.now().minusMonths(6)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			IncomeAmountCertificateContent content = IncomeAmountCertificateContent.builder()
				.issueDate(strField(recentDate))
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).isEmpty();
		}

		@Test
		@DisplayName("발급일이_1년_초과면_위반사항_반환")
		void 발급일이_1년_초과면_위반사항_반환() {
			// given
			String oldDate = LocalDate.now().minusYears(1).minusDays(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			IncomeAmountCertificateContent content = IncomeAmountCertificateContent.builder()
				.issueDate(strField(oldDate))
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).containsExactly("issueDate");
		}

		@Test
		@DisplayName("발급일이_null이면_위반사항_반환")
		void 발급일이_null이면_위반사항_반환() {
			// given
			IncomeAmountCertificateContent content = IncomeAmountCertificateContent.builder()
				.issueDate(null)
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).containsExactly("issueDate");
		}
	}
}
