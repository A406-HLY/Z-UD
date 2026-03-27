import { 
  ReportInput, 
  ReportRequestPayload 
} from '@/entities/verification/model/report.types';
import { ServerDocItem } from '@/entities/verification/model/types';
import { Customer } from '@/entities/customer/model/types';
import { MyDataResDto } from '@/entities/audit/model/types';
import { mergeDotNotation } from '@/shared/lib/utils/merge-utils';

/**
 * [Field Mapping Rules]
 * 각 리포트 필드가 어느 서류(docType)의 어느 경로(path)에서 추출되어야 하는지 정의합니다.
 */
const FIELD_SOURCE_RULES: Record<string, { docType: string; path: string }> = {
  // 1. 인적자원
  'headOfHouseholdName': { docType: 'RESIDENT_REGISTRATION', path: 'headOfHouseholdName' },
  'issueDate': { docType: 'RESIDENT_REGISTRATION_ABSTRACT', path: 'issueDate' },
  'issueNumber': { docType: 'RESIDENT_REGISTRATION_ABSTRACT', path: 'issueNumber' },
  'currentAddress': { docType: 'RESIDENT_REGISTRATION_ABSTRACT', path: 'currentAddress' },
  'moveInHouseholds': { docType: 'RESIDENT_REGISTRATION_ABSTRACT', path: 'moveInHouseholds' },
  'householdMembers': { docType: 'RESIDENT_REGISTRATION', path: 'householdMembers' },
  'spouse': { docType: 'FAMILY_RELATION_CERTIFICATE', path: 'spouse' },

  // 2. 부동산/권리
  'registrationType': { docType: 'TITLE_DEED', path: 'registrationType' },
  'hasDongho': { docType: 'TITLE_DEED', path: 'hasDongho' },
  'lotAddress': { docType: 'TITLE_DEED', path: 'lotAddress' },
  'buildingType': { docType: 'TITLE_DEED', path: 'buildingType' },
  'hasLandRightCause': { docType: 'TITLE_DEED', path: 'hasLandRightCause' },
  'hasOwnershipTransferClaim': { docType: 'TITLE_DEED', path: 'hasOwnershipTransferClaim' },
  'hasTrustRegistration': { docType: 'TITLE_DEED', path: 'hasTrustRegistration' },
  'ownerName': { docType: 'TITLE_DEED', path: 'ownerName' },
  'depositAmountList': { docType: 'TITLE_DEED', path: 'depositAmountList' },
  'seniorRights': { docType: 'TITLE_DEED', path: 'seniorRights' },
  'isViolationBuilding': { docType: 'BUILDING_REGISTER', path: 'isViolationBuilding' },
  'mainUsage': { docType: 'BUILDING_REGISTER', path: 'mainUsage' },
  'floorStatusList': { docType: 'BUILDING_REGISTER', path: 'floorStatusList' },
  'propertyAddress': { docType: 'SALE_CONTRACT', path: 'propertyAddress' },
  'salePrice': { docType: 'SALE_CONTRACT', path: 'salePrice' },
  'specialTerms': { docType: 'SALE_CONTRACT', path: 'specialTerms' },
  'seller': { docType: 'SALE_CONTRACT', path: 'seller' },
  'buyer': { docType: 'SALE_CONTRACT', path: 'buyer' },
  'inspectionAddress': { docType: 'SALE_CONTRACT', path: 'inspectionAddress' },

  // 3. 재직/소득 (근로자)
  'representativeName': { docType: 'EMPLOYMENT_CERTIFICATE', path: 'hasRepresentativeName' },
  'hasCompanySeal': { docType: 'EMPLOYMENT_CERTIFICATE', path: 'hasCompanySeal' },
  'subscriberType': { docType: 'HEALTH_INSURANCE_ELIGIBILITY', path: 'subscriberType' },
  'latestAcquisitionDate': { docType: 'HEALTH_INSURANCE_ELIGIBILITY', path: 'latestAcquisitionDate' },
  'latestLossDate': { docType: 'HEALTH_INSURANCE_ELIGIBILITY', path: 'latestLossDate' },
  'incomeRecipientName': { docType: 'WITHHOLDING_TAX_CERTIFICATE', path: 'incomeRecipientName' },
  'workPeriod': { docType: 'WITHHOLDING_TAX_CERTIFICATE', path: 'workPeriod' },
  'annualIncomeTotal': { docType: 'WITHHOLDING_TAX_CERTIFICATE', path: 'annualIncomeTotal' },
  'manualReviewRequired': { docType: 'SALARY_ACCOUNT_STATEMENT', path: 'manualReviewRequired' },

  // 4. 재직/소득 (자영업자)
  'businessName': { docType: 'BUSINESS_REGISTRATION', path: 'businessName' },
  'businessRegistrationNumber': { docType: 'BUSINESS_REGISTRATION', path: 'businessRegistrationNumber' },
  'openingDate': { docType: 'BUSINESS_REGISTRATION', path: 'issueDate' },
  'incomeYear': { docType: 'INCOME_AMOUNT_CERTIFICATE', path: 'incomeYear' },
  'incomeAmount': { docType: 'INCOME_AMOUNT_CERTIFICATE', path: 'incomeAmount' },
  'determinedTaxAmount': { docType: 'INCOME_AMOUNT_CERTIFICATE', path: 'determinedTaxAmount' },
  'corporateRegistrationNumber': { docType: 'BUSINESS_REGISTRATION', path: 'corporateRegistrationNumber' },
  'taxableSalesAmount': { docType: 'BUSINESS_TAX_CERTIFICATE', path: 'taxableSalesAmount' },

  // 5. 세금 (지방세)
  'taxItems': { docType: 'LOCAL_TAX_ITEM_CERTIFICATE', path: 'taxItems' },
  
  // 6. 기타 전산 정보
  'registrationNumber': { docType: 'RESIDENT_REGISTRATION', path: 'registrationNumber' },
  'identifierNumber': { docType: 'RESIDENT_REGISTRATION', path: 'identifierNumber' },
};

/**
 * [API 규격 준수] 모든 필드를 null로 초기화한 스켈레톤 객체입니다.
 * 없는 데이터는 undefined가 아닌 명시적 null로 채워 전송해야 합니다.
 */
const REPORT_SKELETON: Partial<ReportInput> = {
  headOfHouseholdName: null, name: null, residentRegistrationNumber: null, phoneNumber: null,
  targetLoanAmount: null, loanPurpose: null, ownedHouseCount: null,
  householdMembers: null, currentAddress: null, moveInHouseholds: null,
  spouse: null, registrationType: null, hasDongho: null, buildingType: null,
  lotAddress: null, hasLandRightCause: null, hasOwnershipTransferClaim: null,
  hasTrustRegistration: null, ownerName: null, depositAmountList: null, seniorRights: null,
  isViolationBuilding: null, mainUsage: null, floorStatusList: null,
  propertyAddress: null, salePrice: null, specialTerms: null, seller: null,
  buyer: null, taxItems: null, manualReviewRequired: null,
  registrationNumber: null, identifierNumber: null, inspectionAddress: null,
  collateralMarketPrice: null, totalRemainingLoanBalance: null,
  monthlyRepaymentAmount: null, creditRating: null, annualPrincipalAndInterestRepayment: null,
  // 직업군별 필드 초기값
  businessName: null, businessRegistrationNumber: null, incomeYear: null,
  incomeAmount: null, determinedTaxAmount: null, corporateRegistrationNumber: null, taxableSalesAmount: null, 
  representativeName: null, hasCompanySeal: null, subscriberType: null, 
  latestAcquisitionDate: null, latestLossDate: null, 
  incomeRecipientName: null, incomeRecipientResidentRegistrationNumber: null,
  workPeriod: null, annualIncomeTotal: null,
};

/**
 * 중첩된 객체에서 경로(a.b.c)를 통해 값을 추출하는 헬퍼 함수
 */
const getValueByPath = (obj: unknown, path: string): unknown => {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((prev, curr) => (prev as any)?.[curr], obj);
};

/**
 * 13종 이상의 OCR 서류 뭉치에서 리포트에 필요한 데이터를 규칙에 따라 집계합니다.
 */
const aggregateFromDocuments = (documents: ServerDocItem[]): Partial<ReportInput> => {
  const aggregated: Record<string, unknown> = {};
  
  const docMap: Record<string, ServerDocItem> = {};
  documents.forEach(doc => {
    docMap[doc.documentClassification.documentType] = doc;
  });

  Object.entries(FIELD_SOURCE_RULES).forEach(([field, rule]) => {
    const doc = docMap[rule.docType];
    if (doc) {
      const rawValue = getValueByPath(doc.extraction.content, rule.path);
      if (rawValue !== undefined && rawValue !== null) {
        aggregated[field] = (typeof rawValue === 'object' && 'value' in (rawValue as object)) 
          ? (rawValue as any).value 
          : rawValue;
      }
    }
  });

  return aggregated as Partial<ReportInput>;
};

/**
 * @feature verification/report-factory
 * 컨벤션을 준수하여 가심사 리포트용 최종 DTO를 생성합니다.
 * (Why) FSD 아키텍처 규칙에 따라 도메인 간 결합은 Feature 레이어에서 수행합니다.
 */
export const createReportRequestPayload = (
  ocrData: { data: { documents: ServerDocItem[] } } | null,
  editsValues: Record<string, unknown>,
  userInputData: Customer,
  creditData: MyDataResDto | null,
  loanData: MyDataResDto | null
): ReportRequestPayload => {
  const documents = ocrData?.data?.documents || [];
  const baseAggregated = aggregateFromDocuments(documents);

  // (Why) dot-notation 병합 로직은 unknown 타입을 반환하므로 명시적 캐스팅을 수행합니다.
  const mergedReportInput = mergeDotNotation(baseAggregated, editsValues) as Partial<ReportInput>;

  const isSelfEmployed = userInputData.employmentType === '자영업자';

  const finalReportInput: ReportInput = {
    ...REPORT_SKELETON, // (Zero) 모든 가능한 리포트 필드에 대해 null로 초기화
    ...mergedReportInput,
    
    // (A) 사용자 직접 입력 폼 데이터 (중복 필드에 대해 최우선 순위 부여)
    name: userInputData.name,
    residentRegistrationNumber: userInputData.residentRegistrationNumber,
    phoneNumber: userInputData.phoneNumber,
    targetLoanAmount: parseInt(userInputData.targetLoanAmount.replace(/,/g, ''), 10) || 0,
    loanPurpose: userInputData.loanPurpose,
    ownedHouseCount: parseInt(userInputData.ownedHouseCount, 10) || 0,
    employmentType: isSelfEmployed ? 'SELF_EMPLOYED' : 'EMPLOYEE',

    // (B) 마이데이터 연동 정보 주입 (영문 등급 문자열 그대로 전달)
    creditRating: creditData ? creditData.ratingName : null,
    totalRemainingLoanBalance: loanData?.totalRemainingLoanBalance || 0,
    annualPrincipalAndInterestRepayment: loanData?.totalAnnualPrincipalAndInterestRepayment || 0,
  } as ReportInput;

  // (Why) 직업군별로 문맥상 완전히 무의미한 필드는 API 규격(Discriminated Union) 유지를 위해 명시적으로 삭제합니다.
  // 단, 해당 직업군의 필수 필드가 누락된 경우 위에서 sprade한 SKELETON에 의해 null이 유지됩니다.
  const cleanedInput = { ...finalReportInput } as any;
  if (isSelfEmployed) {
    ['representativeName', 'hasCompanySeal', 'subscriberType', 'latestAcquisitionDate', 'latestLossDate', 'incomeRecipientName', 'incomeRecipientResidentRegistrationNumber', 'workPeriod', 'annualIncomeTotal'].forEach(k => delete cleanedInput[k]);
  } else {
    ['businessName', 'businessRegistrationNumber', 'openingDate', 'incomeYear', 'incomeAmount', 'determinedTaxAmount', 'corporateRegistrationNumber', 'taxableSalesAmount'].forEach(k => delete cleanedInput[k]);
  }

  return {
    consultationId: userInputData.consultationId,
    reportInput: cleanedInput,
  };
};
