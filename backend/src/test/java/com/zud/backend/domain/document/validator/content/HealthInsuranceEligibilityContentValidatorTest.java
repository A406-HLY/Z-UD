package com.zud.backend.domain.document.validator.content;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.dto.request.content.HealthInsuranceEligibilityContent;
import com.zud.backend.domain.document.enums.DocumentTag;

@DisplayName("HealthInsuranceEligibilityContentValidator 단위 테스트")
class HealthInsuranceEligibilityContentValidatorTest {

	private final HealthInsuranceEligibilityContentValidator validator =
		new HealthInsuranceEligibilityContentValidator();

	private DataField<String> strField(String value) {
		return new DataField<>(value, null, null);
	}

	@Test
	@DisplayName("getSupportedTag는_File_005_반환")
	void getSupportedTag는_File_005_반환() {
		assertThat(validator.getSupportedTag())
			.isEqualTo(DocumentTag.FILE_005_HEALTH_INSURANCE_ELIGIBILITY);
	}

	@Nested
	@DisplayName("validate()")
	class Validate {

		@Test
		@DisplayName("정상_직장가입자_검증_통과")
		void 정상_직장가입자_검증_통과() {
			// given
			String pastDate = LocalDate.now().minusMonths(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			HealthInsuranceEligibilityContent content = HealthInsuranceEligibilityContent.builder()
				.subscriberType(strField("직장가입자"))
				.latestAcquisitionDate(strField(pastDate))
				.latestLossDate(null)
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).isEmpty();
		}

		@Test
		@DisplayName("가입자구분이_직장가입자_아니면_위반사항_반환")
		void 가입자구분이_직장가입자_아니면_위반사항_반환() {
			// given
			String pastDate = LocalDate.now().minusMonths(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			HealthInsuranceEligibilityContent content = HealthInsuranceEligibilityContent.builder()
				.subscriberType(strField("지역가입자"))
				.latestAcquisitionDate(strField(pastDate))
				.latestLossDate(null)
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).contains("subscriberType");
		}

		@Test
		@DisplayName("취득일이_미래면_위반사항_반환")
		void 취득일이_미래면_위반사항_반환() {
			// given
			String futureDate = LocalDate.now().plusDays(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			HealthInsuranceEligibilityContent content = HealthInsuranceEligibilityContent.builder()
				.subscriberType(strField("직장가입자"))
				.latestAcquisitionDate(strField(futureDate))
				.latestLossDate(null)
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).contains("latestAcquisitionDate");
		}

		@Test
		@DisplayName("상실일이_존재하면_위반사항_반환")
		void 상실일이_존재하면_위반사항_반환() {
			// given
			String pastDate = LocalDate.now().minusMonths(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			HealthInsuranceEligibilityContent content = HealthInsuranceEligibilityContent.builder()
				.subscriberType(strField("직장가입자"))
				.latestAcquisitionDate(strField(pastDate))
				.latestLossDate(strField("2026-01-01"))
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).contains("latestLossDate");
		}

		@Test
		@DisplayName("모든_조건_위반시_위반사항_3개_반환")
		void 모든_조건_위반시_위반사항_3개_반환() {
			// given
			String futureDate = LocalDate.now().plusDays(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			HealthInsuranceEligibilityContent content = HealthInsuranceEligibilityContent.builder()
				.subscriberType(strField("지역가입자"))
				.latestAcquisitionDate(strField(futureDate))
				.latestLossDate(strField("2026-01-01"))
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).hasSize(3);
		}
	}
}
