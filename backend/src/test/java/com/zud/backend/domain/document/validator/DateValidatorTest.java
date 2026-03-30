package com.zud.backend.domain.document.validator;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.zud.backend.common.dto.common.DataField;

@DisplayName("DateValidator 단위 테스트")
class DateValidatorTest {

	private DataField<String> dateField(String value) {
		return new DataField<>(value, null, null);
	}

	@Nested
	@DisplayName("isWithinDays()")
	class IsWithinDays {

		@Test
		@DisplayName("발급일이_기간_초과시_true_반환")
		void 발급일이_기간_초과시_true_반환() {
			// given
			String oldDate = LocalDate.now().minusDays(31)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			// when
			boolean result = DateValidator.isWithinDays(dateField(oldDate), 30);

			// then
			assertThat(result).isTrue();
		}

		@Test
		@DisplayName("발급일이_기간_이내시_false_반환")
		void 발급일이_기간_이내시_false_반환() {
			// given
			String recentDate = LocalDate.now().minusDays(10)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			// when
			boolean result = DateValidator.isWithinDays(dateField(recentDate), 30);

			// then
			assertThat(result).isFalse();
		}

		@Test
		@DisplayName("날짜필드가_null이면_true_반환")
		void 날짜필드가_null이면_true_반환() {
			// when
			boolean result = DateValidator.isWithinDays(null, 30);

			// then
			assertThat(result).isTrue();
		}

		@Test
		@DisplayName("날짜값이_빈문자열이면_true_반환")
		void 날짜값이_빈문자열이면_true_반환() {
			// when
			boolean result = DateValidator.isWithinDays(dateField(""), 30);

			// then
			assertThat(result).isTrue();
		}

		@Test
		@DisplayName("yyyyMMdd_포맷_파싱_성공")
		void yyyyMMdd_포맷_파싱_성공() {
			// given
			String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

			// when
			boolean result = DateValidator.isWithinDays(dateField(date), 30);

			// then
			assertThat(result).isFalse();
		}

		@Test
		@DisplayName("yyyy_dot_MM_dot_dd_포맷_파싱_성공")
		void yyyy_dot_MM_dot_dd_포맷_파싱_성공() {
			// given
			String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));

			// when
			boolean result = DateValidator.isWithinDays(dateField(date), 30);

			// then
			assertThat(result).isFalse();
		}

		@Test
		@DisplayName("한글날짜_공백포함시_false_반환")
		void 한글날짜_공백포함시_false_반환() {
			// given
			String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy년 MM월 d일"));

			// when
			boolean result = DateValidator.isWithinDays(dateField(date), 30);

			// then
			assertThat(result).isFalse();
		}

		@Test
		@DisplayName("파싱불가_문자열이면_true_반환")
		void 파싱불가_문자열이면_true_반환() {
			// when
			boolean result = DateValidator.isWithinDays(dateField("invalid-date"), 30);

			// then
			assertThat(result).isTrue();
		}
	}

	@Nested
	@DisplayName("isWithinYears()")
	class IsWithinYears {

		@Test
		@DisplayName("발급일이_1년_이내시_true_반환")
		void 발급일이_1년_이내시_true_반환() {
			// given
			String recentDate = LocalDate.now().minusMonths(6)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			// when
			boolean result = DateValidator.isWithinYears(dateField(recentDate), 1);

			// then
			assertThat(result).isTrue();
		}

		@Test
		@DisplayName("발급일이_1년_초과시_false_반환")
		void 발급일이_1년_초과시_false_반환() {
			// given
			String oldDate = LocalDate.now().minusYears(1).minusDays(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			// when
			boolean result = DateValidator.isWithinYears(dateField(oldDate), 1);

			// then
			assertThat(result).isFalse();
		}

		@Test
		@DisplayName("날짜필드가_null이면_false_반환")
		void 날짜필드가_null이면_false_반환() {
			// when
			boolean result = DateValidator.isWithinYears(null, 1);

			// then
			assertThat(result).isFalse();
		}
	}

	@Nested
	@DisplayName("isBeforeOrEqualToday()")
	class IsBeforeOrEqualToday {

		@Test
		@DisplayName("오늘_이전_날짜면_true_반환")
		void 오늘_이전_날짜면_true_반환() {
			// given
			String pastDate = LocalDate.now().minusDays(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			// when
			boolean result = DateValidator.isBeforeOrEqualToday(dateField(pastDate));

			// then
			assertThat(result).isTrue();
		}

		@Test
		@DisplayName("오늘_날짜면_true_반환")
		void 오늘_날짜면_true_반환() {
			// given
			String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			// when
			boolean result = DateValidator.isBeforeOrEqualToday(dateField(today));

			// then
			assertThat(result).isTrue();
		}

		@Test
		@DisplayName("미래_날짜면_false_반환")
		void 미래_날짜면_false_반환() {
			// given
			String futureDate = LocalDate.now().plusDays(1)
				.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			// when
			boolean result = DateValidator.isBeforeOrEqualToday(dateField(futureDate));

			// then
			assertThat(result).isFalse();
		}

		@Test
		@DisplayName("날짜필드가_null이면_false_반환")
		void 날짜필드가_null이면_false_반환() {
			// when
			boolean result = DateValidator.isBeforeOrEqualToday(null);

			// then
			assertThat(result).isFalse();
		}
	}
}
