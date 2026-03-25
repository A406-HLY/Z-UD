package com.zud.backend.domain.document.validator.content;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.document.dto.request.content.TitleDeedContent;
import com.zud.backend.domain.document.enums.DocumentTag;

@DisplayName("TitleDeedContentValidator 단위 테스트")
class TitleDeedContentValidatorTest {

	private final TitleDeedContentValidator validator = new TitleDeedContentValidator();

	private DataField<Boolean> boolField(Boolean value) {
		return new DataField<>(value, null, null);
	}

	@Test
	@DisplayName("getSupportedTag는_File_014_TitleDeed_반환")
	void getSupportedTag는_File_014_TitleDeed_반환() {
		assertThat(validator.getSupportedTag()).isEqualTo(DocumentTag.FILE_014_TITLE_DEED);
	}

	@Nested
	@DisplayName("validate()")
	class Validate {

		@Test
		@DisplayName("소유권이전청구_가등기_있으면_위반사항_반환")
		void 소유권이전청구_가등기_있으면_위반사항_반환() {
			// given
			TitleDeedContent content = TitleDeedContent.builder()
				.hasOwnershipTransferClaim(boolField(true))
				.hasTrustRegistration(boolField(false))
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).containsExactly("hasOwnershipTransferClaim");
		}

		@Test
		@DisplayName("신탁등기_있으면_위반사항_반환")
		void 신탁등기_있으면_위반사항_반환() {
			// given
			TitleDeedContent content = TitleDeedContent.builder()
				.hasOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(true))
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).containsExactly("hasTrustRegistration");
		}

		@Test
		@DisplayName("둘다_있으면_violation_위반사항_2개_반환")
		void 둘다_있으면_violation_위반사항_2개_반환() {
			// given
			TitleDeedContent content = TitleDeedContent.builder()
				.hasOwnershipTransferClaim(boolField(true))
				.hasTrustRegistration(boolField(true))
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).containsExactly(
				"hasOwnershipTransferClaim",
				"hasTrustRegistration"
			);
		}

		@Test
		@DisplayName("문제없으면_빈_리스트_반환")
		void 문제없으면_빈_리스트_반환() {
			// given
			TitleDeedContent content = TitleDeedContent.builder()
				.hasOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).isEmpty();
		}

		@Test
		@DisplayName("필드가_null이면_빈_리스트_반환")
		void 필드가_null이면_빈_리스트_반환() {
			// given
			TitleDeedContent content = TitleDeedContent.builder().build();

			// when
			List<String> result = validator.validate(content);

			// then
			assertThat(result).isEmpty();
		}
	}
}
