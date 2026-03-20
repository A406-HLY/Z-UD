package com.zud.backend.domain.document.validator;

import static org.assertj.core.api.Assertions.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.zud.backend.common.dto.common.DataField;
import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.enums.EmploymentType;
import com.zud.backend.domain.document.dto.request.DocumentDto;
import com.zud.backend.domain.document.dto.request.content.BuildingRegisterContent;
import com.zud.backend.domain.document.dto.request.content.MoveInHouseholdReportContent;
import com.zud.backend.domain.document.dto.request.content.ResidentRegistrationContent;
import com.zud.backend.domain.document.dto.request.content.SaleOrLeaseContractContent;
import com.zud.backend.domain.document.dto.request.content.TitleDeedContent;
import com.zud.backend.domain.document.dto.request.content.WithholdingTaxCertificateContent;
import com.zud.backend.domain.document.dto.response.DocumentValidationResult;
import com.zud.backend.domain.document.validator.content.BuildingRegisterContentValidator;
import com.zud.backend.domain.document.validator.content.HealthInsuranceEligibilityContentValidator;
import com.zud.backend.domain.document.validator.content.IncomeAmountCertificateContentValidator;
import com.zud.backend.domain.document.validator.content.LocalTaxCertificateContentValidator;
import com.zud.backend.domain.document.validator.content.LocalTaxItemCertificateContentValidator;
import com.zud.backend.domain.document.validator.content.NationalTaxCertificateContentValidator;
import com.zud.backend.domain.document.validator.content.TitleDeedContentValidator;

@DisplayName("DocumentValidator 단위 테스트")
class DocumentValidatorTest {

	private final DocumentValidator validator = new DocumentValidator(List.of(
		new BuildingRegisterContentValidator(),
		new TitleDeedContentValidator(),
		new HealthInsuranceEligibilityContentValidator(),
		new IncomeAmountCertificateContentValidator(),
		new NationalTaxCertificateContentValidator(),
		new LocalTaxCertificateContentValidator(),
		new LocalTaxItemCertificateContentValidator()
	));

	private DataField<String> strField(String value) {
		return new DataField<>(value, null, null);
	}

	private DataField<Boolean> boolField(Boolean value) {
		return new DataField<>(value, null, null);
	}

	private String recentDate() {
		return LocalDate.now().minusDays(5).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
	}

	private String oldDate() {
		return LocalDate.now().minusDays(31).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
	}

	private DocumentDto toDocumentDto(
		com.zud.backend.domain.document.dto.request.content.DocumentContent content
	) {
		return DocumentDto.builder()
			.extraction(DocumentDto.ExtractionDetail.builder().content(content).build())
			.build();
	}

	private Consultation defaultConsultation() {
		return Consultation.builder()
			.name("홍길동")
			.residentRegistrationNumber("900101-1234567")
			.employmentType(EmploymentType.EMPLOYEE)
			.build();
	}

	@Nested
	@DisplayName("validateMoveInHouseholdRelations()")
	class ValidateMoveInHouseholdRelations {

		@Test
		@DisplayName("전입세대열람원_없으면_위반사항_없음")
		void 전입세대열람원_없으면_위반사항_없음() {
			// given
			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();

			List<DocumentDto> documents = List.of(toDocumentDto(titleDeed));

			// when
			DocumentValidationResult result = validator.validateAll(documents, defaultConsultation());

			// then
			assertThat(result.violations()).isEmpty();
			assertThat(result.risks()).isEmpty();
		}

		@Test
		@DisplayName("출력일시_30일_초과시_위험사항_반환")
		void 출력일시_30일_초과시_위험사항_반환() {
			// given
			MoveInHouseholdReportContent moveInReport = MoveInHouseholdReportContent.builder()
				.printedAt(strField(oldDate()))
				.moveInHouseholds(List.of())
				.build();

			List<DocumentDto> documents = List.of(toDocumentDto(moveInReport));

			// when
			DocumentValidationResult result = validator.validateAll(documents, defaultConsultation());

			// then
			assertThat(result.risks()).anyMatch(r ->
				r.documentType().equals("MOVE_IN_HOUSEHOLD_REPORT")
					&& r.fields().contains("printedAt")
			);
		}

		@Test
		@DisplayName("세대주_미존재시_위반사항_없음")
		void 세대주_미존재시_위반사항_없음() {
			// given
			MoveInHouseholdReportContent moveInReport = MoveInHouseholdReportContent.builder()
				.printedAt(strField(recentDate()))
				.moveInHouseholds(List.of())
				.build();

			List<DocumentDto> documents = List.of(toDocumentDto(moveInReport));

			// when
			DocumentValidationResult result = validator.validateAll(documents, defaultConsultation());

			// then
			assertThat(result.violations()).isEmpty();
		}

		@Test
		@DisplayName("세대주와_소유자_동일시_위반사항_없음")
		void 세대주와_소유자_동일시_위반사항_없음() {
			// given
			MoveInHouseholdReportContent moveInReport = MoveInHouseholdReportContent.builder()
				.printedAt(strField(recentDate()))
				.moveInHouseholds(List.of(
					MoveInHouseholdReportContent.MoveInHousehold.builder()
						.headOfHouseholdName(strField("홍길동"))
						.moveInDate(strField("2025-01-01"))
						.build()
				))
				.build();

			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(moveInReport),
				toDocumentDto(titleDeed)
			);

			// when
			DocumentValidationResult result = validator.validateAll(documents, defaultConsultation());

			// then
			assertThat(result.violations()).noneMatch(v -> v.fields().contains("headOfHouseholdName"));
		}

		@Test
		@DisplayName("세대주_소유자_불일치_임대계약서_없으면_위반사항_반환")
		void 세대주_소유자_불일치_임대계약서_없으면_위반사항_반환() {
			// given
			MoveInHouseholdReportContent moveInReport = MoveInHouseholdReportContent.builder()
				.printedAt(strField(recentDate()))
				.moveInHouseholds(List.of(
					MoveInHouseholdReportContent.MoveInHousehold.builder()
						.headOfHouseholdName(strField("김철수"))
						.moveInDate(strField("2025-01-01"))
						.build()
				))
				.build();

			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(moveInReport),
				toDocumentDto(titleDeed)
			);

			// when
			DocumentValidationResult result = validator.validateAll(documents, defaultConsultation());

			// then
			assertThat(result.violations()).anyMatch(v ->
				v.documentType().equals("MOVE_IN_HOUSEHOLD_REPORT")
					&& v.fields().contains("headOfHouseholdName")
			);
		}

		@Test
		@DisplayName("세대주_소유자_불일치_임대계약서_있으면_위반사항_없음")
		void 세대주_소유자_불일치_임대계약서_있으면_위반사항_없음() {
			// given
			MoveInHouseholdReportContent moveInReport = MoveInHouseholdReportContent.builder()
				.printedAt(strField(recentDate()))
				.moveInHouseholds(List.of(
					MoveInHouseholdReportContent.MoveInHousehold.builder()
						.headOfHouseholdName(strField("김철수"))
						.moveInDate(strField("2025-01-01"))
						.build()
				))
				.build();

			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();

			SaleOrLeaseContractContent contract = SaleOrLeaseContractContent.builder()
				.buyer(SaleOrLeaseContractContent.Party.builder()
					.name(strField("홍길동")).build())
				.build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(moveInReport),
				toDocumentDto(titleDeed),
				toDocumentDto(contract)
			);

			// when
			DocumentValidationResult result = validator.validateAll(documents, defaultConsultation());

			// then
			assertThat(result.violations()).noneMatch(v -> v.fields().contains("headOfHouseholdName"));
		}
	}

	@Nested
	@DisplayName("validateRequiredDocuments()")
	class ValidateRequiredDocuments {

		@Test
		@DisplayName("근로자_필수서류_모두_제출시_미제출서류목록_비어있음")
		void 근로자_필수서류_모두_제출시_미제출서류목록_비어있음() {
			// given
			ResidentRegistrationContent resident = ResidentRegistrationContent.builder().build();
			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();
			BuildingRegisterContent building = BuildingRegisterContent.builder().build();
			WithholdingTaxCertificateContent withholding =
				WithholdingTaxCertificateContent.builder().build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(resident),
				toDocumentDto(titleDeed),
				toDocumentDto(building),
				toDocumentDto(withholding)
			);

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.EMPLOYEE)
				.build();

			// when
			DocumentValidationResult result = validator.validateAll(documents, consultation);

			// then
			assertThat(result.documentMissings()).isEmpty();
		}

		@Test
		@DisplayName("근로자_근로소득원천징수영수증_누락시_미제출서류목록_포함")
		void 근로자_근로소득원천징수영수증_누락시_미제출서류목록_포함() {
			// given
			ResidentRegistrationContent resident = ResidentRegistrationContent.builder().build();
			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();
			BuildingRegisterContent building = BuildingRegisterContent.builder().build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(resident),
				toDocumentDto(titleDeed),
				toDocumentDto(building)
			);

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.EMPLOYEE)
				.build();

			// when
			DocumentValidationResult result = validator.validateAll(documents, consultation);

			// then
			assertThat(result.documentMissings()).anyMatch(m ->
				m.documentType().equals("WITHHOLDING_TAX_CERTIFICATE")
			);
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
			assertThat(result.documentMissings()).anyMatch(m ->
				m.documentType().equals("RESIDENT_REGISTRATION")
			);
			assertThat(result.documentMissings()).anyMatch(m ->
				m.documentType().equals("TITLE_DEED")
			);
			assertThat(result.documentMissings()).anyMatch(m ->
				m.documentType().equals("BUILDING_REGISTER")
			);
		}

		@Test
		@DisplayName("개인_사업자_소득금액증명원_누락시_미제출서류목록_포함")
		void 개인_사업자_소득금액증명원_누락시_미제출서류목록_포함() {
			// given
			ResidentRegistrationContent resident = ResidentRegistrationContent.builder().build();
			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("홍길동"))
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();
			BuildingRegisterContent building = BuildingRegisterContent.builder().build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(resident),
				toDocumentDto(titleDeed),
				toDocumentDto(building)
			);

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.SELF_EMPLOYED)
				.build();

			// when
			DocumentValidationResult result = validator.validateAll(documents, consultation);

			// then
			assertThat(result.documentMissings()).anyMatch(m ->
				m.documentType().equals("INCOME_AMOUNT_CERTIFICATE")
			);
		}
	}

	@Nested
	@DisplayName("validateCrossDocuments()")
	class ValidateCrossDocuments {

		@Test
		@DisplayName("이름_불일치시_위반사항_반환")
		void 이름_불일치시_위반사항_반환() {
			// given
			TitleDeedContent titleDeed = TitleDeedContent.builder()
				.ownerName(strField("김철수"))
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
				.hasTrustRegistration(boolField(false))
				.build();

			SaleOrLeaseContractContent contract = SaleOrLeaseContractContent.builder()
				.buyer(SaleOrLeaseContractContent.Party.builder()
					.name(strField("홍길동")).build())
				.build();

			Consultation consultation = Consultation.builder()
				.name("홍길동")
				.employmentType(EmploymentType.EMPLOYEE)
				.build();

			List<DocumentDto> documents = List.of(
				toDocumentDto(titleDeed),
				toDocumentDto(contract)
			);

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
				.hasProvisionalRegistrationForOwnershipTransferClaim(boolField(false))
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
