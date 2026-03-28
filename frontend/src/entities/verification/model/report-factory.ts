import { 
  ReportInput, 
  ReportRequestPayload 
} from '@/entities/verification/model/report.types';
import { ServerDocItem } from '@/entities/verification/model/types';
import { Customer } from '@/entities/customer/model/types';
import { MyDataResDto, HouseAuditResponseDto } from '@/entities/audit/model/types';
import { mergeDotNotation } from '@/shared/lib/utils/merge-utils';

/**
 * [Field Mapping Rules]
 * 각 리포트 필드가 어느 서류(docType)의 어느 경로(path)에서 추출되어야 하는지 정의합니다.
 */
const FIELD_SOURCE_RULES: Record<string, { docType: string; path: string }> = {
  // 1. 인적자원
  'headOfHouseholdName': { docType: 'RESIDENT_REGISTRATION', path: 'headOfHouseholdName' },
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
  'mainUsage': { docType: 'TITLE_DEED', path: 'buildingType.value' },
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
 * [API 규격 준수] 모든 필드를 초기화한 스켈레톤 객체입니다.
 * 백엔드 엄격 스키마 검사를 통과하기 위해 null 대신 기본값(Zero-value)을 할당합니다.
 */
const REPORT_SKELETON: ReportInput = {
  headOfHouseholdName: "", name: "", residentRegistrationNumber: "",
  employmentType: "EMPLOYEE",
  householdMembers: [], currentAddress: "", moveInHouseholds: [],
  spouse: { exists: false, name: "", residentRegistrationNumber: "" }, 
  registrationType: "", buildingType: "", hasDongho: false,
  lotAddress: "", hasLandRightCause: false, hasOwnershipTransferClaim: false,
  hasTrustRegistration: false, ownerName: "", depositAmountList: [], seniorRights: [],
  isViolationBuilding: false, mainUsage: "", floorStatusList: [],
  propertyAddress: "", salePrice: 0, specialTerms: "", seller: { name: "" },
  buyer: { name: "" }, taxItems: [], manualReviewRequired: false,
  registrationNumber: "", identifierNumber: "", inspectionAddress: "",
  collateralMarketPrice: 0, totalRemainingLoanBalance: 0,
  monthlyRepaymentAmount: 0, creditRating: "", annualPrincipalAndInterestRepayment: 0,
  businessName: "", businessRegistrationNumber: "", incomeYear: "",
  incomeAmount: 0, determinedTaxAmount: 0, corporateRegistrationNumber: "", taxableSalesAmount: 0, 
  representativeName: false, hasCompanySeal: false, subscriberType: "", 
  latestAcquisitionDate: "", latestLossDate: "", 
  incomeRecipientName: "", incomeRecipientResidentRegistrationNumber: "",
  workPeriod: "", annualIncomeTotal: 0,
  loanPurpose: "", ownedHouseCount: 0,
} as any;

/**
 * 중첩된 객체에서 경로(a.b.c)를 통해 값을 추출하는 헬퍼 함수
 */
const getValueByPath = (obj: unknown, path: string): unknown => {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((prev, curr) => (prev as any)?.[curr], obj);
};

/**
 * 다양한 날짜 형식(YYYY.MM.DD, YYYY년...)을 서버 표준(YYYY-MM-DD)으로 변환합니다.
 */
const standardizeDateFormat = (dateStr: any): string | any => {
  if (typeof dateStr !== 'string' || !dateStr) return dateStr || "";
  // 1. 점(.) 또는 한글 제거 및 공백 정규화
  const sanitized = dateStr.replace(/\./g, '-').replace(/[년월일]/g, '-').replace(/\s+/g, '');
  // 2. 마지막 하이픈 제거 (예: 2024-01-01-)
  let formatted = sanitized.replace(/-+$/, '');
  
  // 3. YYYY-MM-DD 자릿수 보정 (단순화된 정규식)
  const parts = formatted.split('-');
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return formatted;
};

/**
 * OCR 결과에 포함된 { value, confidence, evidence } 형태의 래퍼 객체를 
 * 재귀적으로 순회하며 원시 값(value)만 깨끗하게 추출합니다.
 */
const deepUnwrapOcrValue = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => deepUnwrapOcrValue(item));
  }
  if (obj !== null && typeof obj === 'object') {
    if ('value' in obj) {
      return deepUnwrapOcrValue(obj.value);
    } else {
      const result: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        result[key] = deepUnwrapOcrValue(val);
      }
      return result;
    }
  }
  return obj; // 원시 데이터 타입
};

/**
 * 13종 이상의 OCR 서류 뭉치에서 리포트에 필요한 데이터를 규칙에 따라 집계합니다.
 */
export const aggregateFromDocuments = (documents: ServerDocItem[]): Partial<ReportInput> => {
  const aggregated: Record<string, unknown> = {};
  
  const docMap: Record<string, ServerDocItem> = {};
  documents.forEach(doc => {
    docMap[doc.documentClassification.documentType] = doc;
  });

Object.entries(FIELD_SOURCE_RULES).forEach(([field, rule]) => {
    const doc = docMap[rule.docType];
    if (doc) {
      const rawValue = getValueByPath(doc.content, rule.path);
      if (rawValue !== undefined && rawValue !== null) {
        let unwrapped = deepUnwrapOcrValue(rawValue);

        // [날짜 정규화] 날짜 관련 필드는 포맷 통일
        if (field.toLowerCase().includes('date') || field === 'workPeriod') {
          unwrapped = standardizeDateFormat(unwrapped);
        }

        // [Custom Mapping] API DTO 규격에 맞춘 강제 구조화
        if (field === 'spouse') {
          if (typeof unwrapped === 'string' && unwrapped.trim() !== '') {
             unwrapped = { exists: true, name: unwrapped, residentRegistrationNumber: "" };
          } else if (typeof unwrapped === 'object' && unwrapped !== null) {
             unwrapped.exists = true; 
             unwrapped.name = unwrapped.name || "";
             unwrapped.residentRegistrationNumber = unwrapped.residentRegistrationNumber || "";
          } else {
             unwrapped = { exists: false, name: "", residentRegistrationNumber: "" };
          }
        } else if (field === 'seller' || field === 'buyer') {
          unwrapped = { name: (typeof unwrapped === 'string' ? unwrapped : (unwrapped?.name || "")) };
        } else if (field === 'representativeName' || field === 'hasCompanySeal' || field === 'isViolationBuilding' || field === 'manualReviewRequired') {
           unwrapped = !!unwrapped;
        } else if (Array.isArray(unwrapped)) {
           // 배열 내의 날짜들도 정규화 (예: depositAmountList 내의 depositDate)
           unwrapped = unwrapped.map(item => {
             if (item && typeof item === 'object') {
               const newItem = { ...item };
               Object.keys(newItem).forEach(k => {
                 if (k.toLowerCase().includes('date')) newItem[k] = standardizeDateFormat(newItem[k]);
               });
               return newItem;
             }
             return item;
           });
        }

        aggregated[field] = unwrapped;
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
  ocrData: { documents: ServerDocItem[] } | null,
  editsValues: Record<string, unknown>,
  userInputData: Customer,
  creditData: MyDataResDto | null,
  loanData: MyDataResDto | null,
  houseData?: HouseAuditResponseDto['data'] | null
): ReportRequestPayload => {
  const documents = ocrData?.documents || [];
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
    employmentType: isSelfEmployed ? 'SELF_EMPLOYED' : 'EMPLOYEE',
    loanPurpose: userInputData.loanPurpose,
    ownedHouseCount: parseInt(userInputData.ownedHouseCount) || 0,

    // (B) 마이데이터 연동 정보 주입 (영문 등급 문자열 그대로 전달)
    creditRating: creditData ? creditData.ratingName : null,
    totalRemainingLoanBalance: loanData?.totalRemainingLoanBalance || 0,
    annualPrincipalAndInterestRepayment: loanData?.totalAnnualPrincipalAndInterestRepayment || 0,

    // (C) 주택 심사 정보 주입 (price는 만원 단위이므로 그대로 전달 또는 원 단위 변환 필요 여부 확인 - 백엔드 규격에 따름)
    collateralMarketPrice: houseData?.housePrice?.price || 0,
  } as ReportInput;

  return {
    consultationId: userInputData.consultationId,
    reportInput: finalReportInput,
  };
};

/**
 * @feature verification/report-factory
 * Redux 상태(본인인증 Customer 정보)와 기존 가심사 결과(ReportInput)를 혼합하여
 * 백엔드 전산 이관(Transfer) API 스펙에 맞는 최종 Payload를 생성합니다.
 * 백엔드가 배열형 데이터를 수용하기로 협의됨에 따라, 원본 배열형은 그대로 유지하되
 * 날짜 포맷팅 및 Redux 필수값(phoneNumber 등)만 추가 주입합니다.
 */
export const createLegacyTransferPayload = (
  originalReport: ReportInput,
  customerData: Customer,
  productName: string
): any => { // 백엔드의 ConsultationTransferReqDto 구조
  const transferReportInput: any = { ...originalReport };

  // 1. 날짜 필드 포맷 정규화 (YYYY-MM-DD 변환)
  if (transferReportInput.issueDate) {
    transferReportInput.issueDate = standardizeDateFormat(transferReportInput.issueDate);
  }
  if (transferReportInput.latestAcquisitionDate) {
    transferReportInput.latestAcquisitionDate = standardizeDateFormat(transferReportInput.latestAcquisitionDate);
  }
  if (transferReportInput.latestLossDate) {
    transferReportInput.latestLossDate = standardizeDateFormat(transferReportInput.latestLossDate);
  }

  // 2. Redux Store(Customer)에서 누락되었던 전산 기입 필수값 채우기
  transferReportInput.phoneNumber = customerData.phoneNumber || "";
  
  // 콤마 제거 후 숫자로 파싱 (100,000,000 -> 100000000)
  const sanitizeNumber = (val: any) => typeof val === 'string' ? Number(val.replace(/,/g, '')) || 0 : Number(val) || 0;
  
  transferReportInput.targetLoanAmount = sanitizeNumber(customerData.targetLoanAmount);
  transferReportInput.ownedHouseCount = sanitizeNumber(customerData.ownedHouseCount);

  // 대출 목적 매핑 (한글 -> 영문 Enum 상수)
  switch (customerData.loanPurpose) {
    case '생활안정자금목적':
      transferReportInput.loanPurpose = 'LIVING_STABILITY';
      break;
    case '주택구입목적':
    default:
      transferReportInput.loanPurpose = 'HOME_PURCHASE';
      break;
  }

  // 3. 사용자가 최종 선택한 상품명 주입
  transferReportInput.productName = productName;

  // 4. 백엔드 DTO { reportInput: { ... } } 형태로 감싸서 반환
  return {
    reportInput: transferReportInput
  };
};

