package com.zud.backend.domain.document.enums;

import com.zud.backend.domain.document.dto.request.content.BuildingRegisterContent;
import com.zud.backend.domain.document.dto.request.content.BusinessRegistrationCertificateContent;
import com.zud.backend.domain.document.dto.request.content.DocumentContent;
import com.zud.backend.domain.document.dto.request.content.EmploymentCertificateContent;
import com.zud.backend.domain.document.dto.request.content.FamilyRelationCertificateContent;
import com.zud.backend.domain.document.dto.request.content.HealthInsuranceEligibilityContent;
import com.zud.backend.domain.document.dto.request.content.IncomeAmountCertificateContent;
import com.zud.backend.domain.document.dto.request.content.LocalTaxCertificateContent;
import com.zud.backend.domain.document.dto.request.content.LocalTaxItemCertificateContent;
import com.zud.backend.domain.document.dto.request.content.NationalTaxCertificateContent;
import com.zud.backend.domain.document.dto.request.content.ResidentRegistrationAbstractContent;
import com.zud.backend.domain.document.dto.request.content.ResidentRegistrationContent;
import com.zud.backend.domain.document.dto.request.content.SalaryAccountStatementContent;
import com.zud.backend.domain.document.dto.request.content.SaleOrLeaseContractContent;
import com.zud.backend.domain.document.dto.request.content.TitleDeedContent;
import com.zud.backend.domain.document.dto.request.content.VatTaxBaseCertificateContent;
import com.zud.backend.domain.document.dto.request.content.WithholdingTaxCertificateContent;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(description = "17종 자동화 대상 서류 식별 태그")
public enum DocumentTag {

	@Schema(description = "주민등록등본")
	FILE_001_RESIDENT_REGISTRATION("RESIDENT_REGISTRATION", "주민등록등본",
		ResidentRegistrationContent.class),

	@Schema(description = "주민등록초본")
	FILE_002_RESIDENT_REGISTRATION_ABSTRACT("RESIDENT_REGISTRATION_ABSTRACT", "주민등록초본",
		ResidentRegistrationAbstractContent.class),

	@Schema(description = "가족관계증명서")
	FILE_003_FAMILY_RELATION_CERTIFICATE("FAMILY_RELATION_CERTIFICATE", "가족관계증명서",
		FamilyRelationCertificateContent.class),

	@Schema(description = "재직증명서")
	FILE_004_EMPLOYMENT_CERTIFICATE("EMPLOYMENT_CERTIFICATE", "재직증명서",
		EmploymentCertificateContent.class),

	@Schema(description = "건강보험 자격득실 확인서")
	FILE_005_HEALTH_INSURANCE_ELIGIBILITY("HEALTH_INSURANCE_ELIGIBILITY", "건강보험 자격득실 확인서",
		HealthInsuranceEligibilityContent.class),

	@Schema(description = "근로소득 원천징수영수증")
	FILE_006_WITHHOLDING_TAX_CERTIFICATE("WITHHOLDING_TAX_CERTIFICATE", "근로소득 원천징수영수증",
		WithholdingTaxCertificateContent.class),

	@Schema(description = "급여통장거래내역서")
	FILE_007_SALARY_ACCOUNT_STATEMENT("SALARY_ACCOUNT_STATEMENT", "급여통장거래내역서",
		SalaryAccountStatementContent.class),

	@Schema(description = "소득금액증명원")
	FILE_008_INCOME_AMOUNT_CERTIFICATE("INCOME_AMOUNT_CERTIFICATE", "소득금액증명원",
		IncomeAmountCertificateContent.class),

	@Schema(description = "사업자등록증명원")
	FILE_009_BUSINESS_REGISTRATION_CERTIFICATE("BUSINESS_REGISTRATION_CERTIFICATE", "사업자등록증명원",
		BusinessRegistrationCertificateContent.class),

	@Schema(description = "부가가치세과세표준증명")
	FILE_010_VAT_TAX_BASE_CERTIFICATE("VAT_TAX_BASE_CERTIFICATE", "부가가치세과세표준증명",
		VatTaxBaseCertificateContent.class),

	@Schema(description = "납세증명서(국세완납증명)")
	FILE_011_NATIONAL_TAX_CERTIFICATE("NATIONAL_TAX_CERTIFICATE", "납세증명서(국세완납증명)",
		NationalTaxCertificateContent.class),

	@Schema(description = "지방세 납세증명서")
	FILE_012_LOCAL_TAX_CERTIFICATE("LOCAL_TAX_CERTIFICATE", "지방세 납세증명서",
		LocalTaxCertificateContent.class),

	@Schema(description = "지방세 세목별 과세증명")
	FILE_013_LOCAL_TAX_ITEM_CERTIFICATE("LOCAL_TAX_ITEM_CERTIFICATE", "지방세 세목별 과세증명",
		LocalTaxItemCertificateContent.class),

	@Schema(description = "등기권리증")
	FILE_014_TITLE_DEED("TITLE_DEED", "등기사항전부증명서",
		TitleDeedContent.class),

	@Schema(description = "집합건축물대장")
	FILE_015_BUILDING_REGISTER("BUILDING_REGISTER", "집합건축물대장",
		BuildingRegisterContent.class),

	@Schema(description = "매매계약서")
	FILE_016_SALE_CONTRACT("SALE_CONTRACT", "매매계약서",
		SaleOrLeaseContractContent.class);

	private final String documentType;
	private final String label;
	private final Class<? extends DocumentContent> contentClass;

	public static DocumentTag fromDocumentType(String documentType) {
		for (DocumentTag tag : values()) {
			if (tag.getDocumentType().equals(documentType)) {
				return tag;
			}
		}
		return null;
	}
}
