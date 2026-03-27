package com.zud.backend.domain.document.validator;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.enums.EmploymentType;
import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.request.content.BuildingRegisterContent;
import com.zud.backend.domain.document.dto.request.content.EmploymentCertificateContent;
import com.zud.backend.domain.document.dto.request.content.ResidentRegistrationContent;
import com.zud.backend.domain.document.dto.request.content.SaleOrLeaseContractContent;
import com.zud.backend.domain.document.dto.request.content.TitleDeedContent;
import com.zud.backend.domain.document.dto.response.DocumentValidationResult;
import com.zud.backend.domain.document.validator.content.HealthInsuranceEligibilityContentValidator;
import com.zud.backend.domain.document.validator.content.IncomeAmountCertificateContentValidator;
import com.zud.backend.domain.document.validator.content.LocalTaxCertificateContentValidator;
import com.zud.backend.domain.document.validator.content.LocalTaxItemCertificateContentValidator;
import com.zud.backend.domain.document.validator.content.NationalTaxCertificateContentValidator;
import com.zud.backend.domain.document.validator.content.TitleDeedContentValidator;

@DisplayName("DocumentValidator 단위 테스트")
class DocumentValidatorTest {

	private final DocumentValidator validator = new DocumentValidator(List.of(
		new TitleDeedContentValidator(),
		new HealthInsuranceEligibilityContentValidator(),
		new IncomeAmountCertificateContentValidator(),
		new NationalTaxCertificateContentValidator(),
		new LocalTaxCertificateContentValidator(),
		new LocalTaxItemCertificateContentValidator()));

	private DataField<String> strField(String value) {
		return new DataField<>(value, null, null);
	}

	private DataField<Boolean> boolField(Boolean value) {
		return new DataField<>(value, null, null);
	}

	private DocumentDto toDocumentDto(
		com.zud.backend.domain.document.dto.request.content.DocumentContent content
	) {
		return DocumentDto.builder()
			.content(content)
			.build();
	}

	@Nested
	@DisplayName("validateRequiredDocuments()")
	class ValidateRequiredDocuments {

		@Test
		@DisplayName("근로자_근로소득원천징수영수증_누락시_미제출서류목록_포함")
		void 근로자_근로소득원천징수영수증_누락시_미제출서류목록_포함() {
			// given
			ResidentRegistrationContent resident = ResidentRegistrationContent.builder().build();
			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasTrustRegistration(boolField(false))
				.build();
			BuildingRegisterContent building = BuildingRegisterContent.builder().build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(resident),
				toDocumentDto(titleDeed),
				toDocumentDto(building));

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.EMPLOYEE)
				.build();

			// when
			DocumentValidationResult result = validator.validateAll(documents, consultation);

			// then
			assertThat(result.documentMissings()).anyMatch(m -> m.documentType().equals("WITHHOLDING_TAX_CERTIFICATE"));
		}

		@Test
		@DisplayName("공통_필수서류_누락시_미제출서류목록_포함")
		void 공통_필수서류_누락시_미제출서류목록_포함() {
			// given
			List<DocumentDto> documents = List.of();

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.EMPLOYEE)
				.build();

			// when
			DocumentValidationResult result = validator.validateAll(documents, consultation);

			// then
			assertThat(result.documentMissings()).anyMatch(m -> m.documentType().equals("RESIDENT_REGISTRATION"));
			assertThat(result.documentMissings()).anyMatch(m -> m.documentType().equals("TITLE_DEED"));
			assertThat(result.documentMissings()).anyMatch(m -> m.documentType().equals("BUILDING_REGISTER"));
		}

		@Test
		@DisplayName("개인_사업자_소득금액증명원_누락시_미제출서류목록_포함")
		void 개인_사업자_소득금액증명원_누락시_미제출서류목록_포함() {
			// given
			ResidentRegistrationContent resident = ResidentRegistrationContent.builder().build();
			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();
			BuildingRegisterContent building = BuildingRegisterContent.builder().build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(resident),
				toDocumentDto(titleDeed),
				toDocumentDto(building));

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.SELF_EMPLOYED)
				.build();

			// when
			DocumentValidationResult result = validator.validateAll(documents, consultation);

			// then
			assertThat(result.documentMissings()).anyMatch(m -> m.documentType().equals("INCOME_AMOUNT_CERTIFICATE"));
		}
	}

	@Nested
	@DisplayName("validateCrossDocuments()")
	class ValidateCrossDocuments {

		@Test
		@DisplayName("이름_불일치시_위반사항_반환")
		void 이름_불일치시_위반사항_반환() {
			// given
			EmploymentCertificateContent employment = EmploymentCertificateContent.builder()
				.name(strField("김철수"))
				.build();

			SaleOrLeaseContractContent contract = SaleOrLeaseContractContent.builder()
				.buyer(strField("홍길동"))
				.build();

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.EMPLOYEE)
				.build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(employment),
				toDocumentDto(contract));

			// when
			DocumentValidationResult result = validator.validateAll(documents, consultation);

			// then
			assertThat(result.violations()).anyMatch(v -> v.fields().contains("name"));
		}

		@Test
		@DisplayName("이름_일치시_위반사항_없음")
		void 이름_일치시_위반사항_없음() {
			// given
			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.EMPLOYEE)
				.build();

			List<DocumentDto> documents = List.of(toDocumentDto(titleDeed));

			// when
			DocumentValidationResult result = validator.validateAll(documents, consultation);

			// then
			assertThat(result.violations()).isEmpty();
		}
	}
}
