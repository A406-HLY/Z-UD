import {
  ReportInput,
  ReportRequestPayload
} from '@/entities/verification/model/report.types';
import { ServerDocItem } from '@/entities/verification/model/types';
import { Customer } from '@/entities/customer/model/types';
import { LOAN_PURPOSE_MAP, LoanPurposeOption } from '@/entities/customer/model/customer.constants';
import { MyDataResDto, HouseAuditResponseDto } from '@/entities/audit/model/types';
import { mergeDotNotation } from '@/shared/lib/utils/merge-utils';

const FIELD_SOURCE_RULES: Record<string, { docType: string; path: string }> = {
  'headOfHouseholdName': { docType: 'RESIDENT_REGISTRATION', path: 'headOfHouseholdName' },
  'currentAddress': { docType: 'RESIDENT_REGISTRATION_ABSTRACT', path: 'currentAddress' },
  'moveInHouseholds': { docType: 'RESIDENT_REGISTRATION_ABSTRACT', path: 'moveInHouseholds' },
  'householdMembers': { docType: 'RESIDENT_REGISTRATION', path: 'householdMembers' },
  'spouse': { docType: 'FAMILY_RELATION_CERTIFICATE', path: 'spouse' },

  'registrationType': { docType: 'TITLE_DEED', path: 'registrationType' },
  'issueDate': { docType: 'TITLE_DEED', path: 'issueDate' },
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

  'representativeName': { docType: 'EMPLOYMENT_CERTIFICATE', path: 'hasRepresentativeName' },
  'hasCompanySeal': { docType: 'EMPLOYMENT_CERTIFICATE', path: 'hasCompanySeal' },
  'subscriberType': { docType: 'HEALTH_INSURANCE_ELIGIBILITY', path: 'subscriberType' },
  'latestAcquisitionDate': { docType: 'HEALTH_INSURANCE_ELIGIBILITY', path: 'latestAcquisitionDate' },
  'latestLossDate': { docType: 'HEALTH_INSURANCE_ELIGIBILITY', path: 'latestLossDate' },
  'incomeRecipientName': { docType: 'WITHHOLDING_TAX_CERTIFICATE', path: 'incomeRecipientName' },
  'workPeriod': { docType: 'WITHHOLDING_TAX_CERTIFICATE', path: 'workPeriod' },
  'annualIncomeTotal': { docType: 'WITHHOLDING_TAX_CERTIFICATE', path: 'annualIncomeTotal' },
  'manualReviewRequired': { docType: 'SALARY_ACCOUNT_STATEMENT', path: 'manualReviewRequired' },

  'businessName': { docType: 'BUSINESS_REGISTRATION', path: 'businessName' },
  'businessRegistrationNumber': { docType: 'BUSINESS_REGISTRATION', path: 'businessRegistrationNumber' },
  'openingDate': { docType: 'BUSINESS_REGISTRATION', path: 'issueDate' },
  'incomeYear': { docType: 'INCOME_AMOUNT_CERTIFICATE', path: 'incomeYear' },
  'incomeAmount': { docType: 'INCOME_AMOUNT_CERTIFICATE', path: 'incomeAmount' },
  'determinedTaxAmount': { docType: 'INCOME_AMOUNT_CERTIFICATE', path: 'determinedTaxAmount' },
  'corporateRegistrationNumber': { docType: 'BUSINESS_REGISTRATION', path: 'corporateRegistrationNumber' },
  'taxableSalesAmount': { docType: 'BUSINESS_TAX_CERTIFICATE', path: 'taxableSalesAmount' },

  'taxItems': { docType: 'LOCAL_TAX_ITEM_CERTIFICATE', path: 'taxItems' },

  'registrationNumber': { docType: 'RESIDENT_REGISTRATION', path: 'registrationNumber' },
  'identifierNumber': { docType: 'RESIDENT_REGISTRATION', path: 'identifierNumber' },
};

const REPORT_SKELETON: ReportInput = {
  headOfHouseholdName: null, name: null, residentRegistrationNumber: null,
  employmentType: "EMPLOYEE",
  householdMembers: null, currentAddress: null, moveInHouseholds: null,
  spouse: null,
  registrationType: null, buildingType: null, hasDongho: null,
  lotAddress: null, hasLandRightCause: null, hasOwnershipTransferClaim: null,
  hasTrustRegistration: null, ownerName: null, depositAmountList: null, seniorRights: null,
  isViolationBuilding: null, mainUsage: null, floorStatusList: null,
  propertyAddress: null, salePrice: null, specialTerms: null, seller: null,
  buyer: null, taxItems: null, manualReviewRequired: null,
  registrationNumber: null, identifierNumber: null, inspectionAddress: null,
  collateralMarketPrice: null, totalRemainingLoanBalance: null,
  monthlyRepaymentAmount: null, creditRating: null, annualPrincipalAndInterestRepayment: null,
  businessName: null, businessRegistrationNumber: null, incomeYear: null,
  incomeAmount: null, determinedTaxAmount: null, corporateRegistrationNumber: null, taxableSalesAmount: null,
  representativeName: null, hasCompanySeal: null, subscriberType: null,
  latestAcquisitionDate: null, latestLossDate: null,
  incomeRecipientName: null, incomeRecipientResidentRegistrationNumber: null,
  workPeriod: null, annualIncomeTotal: null,
  loanPurpose: null, ownedHouseCount: null, targetLoanAmount: null,
  issueDate: null,
} as any;

const getValueByPath = (obj: unknown, path: string): unknown => {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((prev, curr) => (prev as any)?.[curr], obj);
};

const standardizeDateFormat = (dateStr: any): string | any => {
  if (typeof dateStr !== 'string' || !dateStr) return dateStr || "";
  const sanitized = dateStr.replace(/\./g, '-').replace(/[년월일]/g, '-').replace(/\s+/g, '');
  const formatted = sanitized.replace(/-+$/, '');

  const parts = formatted.split('-');
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return formatted;
};

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
  return obj;
};

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

        if (field.toLowerCase().includes('date') || field === 'workPeriod') {
          unwrapped = standardizeDateFormat(unwrapped);
        }

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

  const mergedReportInput = mergeDotNotation(baseAggregated, editsValues) as Partial<ReportInput>;

  const isSelfEmployed = userInputData.employmentType === '자영업자';

  const finalReportInput: ReportInput = {
    ...REPORT_SKELETON,
    ...mergedReportInput,

    name: userInputData.name,
    residentRegistrationNumber: userInputData.residentRegistrationNumber,
    employmentType: isSelfEmployed ? 'SELF_EMPLOYED' : 'EMPLOYEE',
    loanPurpose: LOAN_PURPOSE_MAP[userInputData.loanPurpose as LoanPurposeOption] || userInputData.loanPurpose,
    ownedHouseCount: userInputData.ownedHouseCount ? parseInt(userInputData.ownedHouseCount, 10) : null,
    targetLoanAmount: userInputData.targetLoanAmount ? parseInt(userInputData.targetLoanAmount.replace(/,/g, ''), 10) : null,

    creditRating: creditData ? creditData.ratingName : null,
    totalRemainingLoanBalance: loanData?.totalRemainingLoanBalance ?? null,
    annualPrincipalAndInterestRepayment: loanData?.totalAnnualPrincipalAndInterestRepayment ?? null,

    collateralMarketPrice: houseData?.housePrice?.price ?? null,
  } as ReportInput;

  return {
    consultationId: userInputData.consultationId,
    reportInput: finalReportInput,
  };
};

export const createLegacyTransferPayload = (
  originalReport: ReportInput,
  customerData: Customer,
  productName: string
): any => {
  const transferReportInput: any = { ...originalReport };

  const standardizeDate = (val: any) => standardizeDateFormat(val);
  transferReportInput.issueDate = standardizeDate(transferReportInput.issueDate);
  transferReportInput.latestAcquisitionDate = standardizeDate(transferReportInput.latestAcquisitionDate);
  transferReportInput.latestLossDate = standardizeDate(transferReportInput.latestLossDate);

  transferReportInput.phoneNumber = customerData.phoneNumber || "";
  transferReportInput.targetLoanAmount = typeof customerData.targetLoanAmount === 'string' ? Number(customerData.targetLoanAmount.replace(/,/g, '')) : Number(customerData.targetLoanAmount);
  transferReportInput.ownedHouseCount = Number(customerData.ownedHouseCount) || 0;
  transferReportInput.productName = productName;

  switch (customerData.loanPurpose) {
    case '생활안정자금목적': transferReportInput.loanPurpose = 'LIVING_STABILITY'; break;
    case '주택구입목적': default: transferReportInput.loanPurpose = 'HOME_PURCHASE'; break;
  }

  return {
    reportInput: transferReportInput
  };
};

export const mapReportToBankSystemFormat = (originalPayload: any): any => {
  const mapped: any = JSON.parse(JSON.stringify(originalPayload));
  const input = mapped.reportInput;

  const mapBool = (val: any, trueLabel = "적정", falseLabel = "부적정") => val ? trueLabel : falseLabel;
  const mapList = (list: any[], key?: string) => {
    if (!Array.isArray(list)) return list || "";
    return list.map(item => (key && typeof item === 'object') ? item[key] : String(item)).join(", ");
  };

  input.hasDongho = mapBool(input.hasDongho, "포함", "미포함");
  input.isViolationBuilding = mapBool(input.isViolationBuilding, "위반", "정상");
  input.hasLandRightCause = mapBool(input.hasLandRightCause, "있음", "없음");
  input.hasOwnershipTransferClaim = mapBool(input.hasOwnershipTransferClaim, "있음", "없음");
  input.hasTrustRegistration = mapBool(input.hasTrustRegistration, "있음", "없음");
  input.representativeName = mapBool(input.representativeName, "확인", "미확인");
  input.hasCompanySeal = mapBool(input.hasCompanySeal, "있음", "없음");
  input.manualReviewRequired = mapBool(input.manualReviewRequired, "대상", "비대상");

  if (input.spouse) {
    input["spouse.exists"] = input.spouse.exists ? "유" : "무";
    input["spouse.name"] = input.spouse.name || "";
    input["spouse.residentRegistrationNumber"] = input.spouse.residentRegistrationNumber || "";
  }

  input.moveInHouseholds = mapList(input.moveInHouseholds);
  input.householdMembers = mapList(input.householdMembers, "name");
  input.depositAmountList = mapList(input.depositAmountList);
  input.taxItems = mapList(input.taxItems, "taxItemName");
  input.seniorRights = mapList(input.seniorRights, "maximumClaimAmount");
  input.floorStatusList = mapList(input.floorStatusList, "floor");

  return mapped;
};