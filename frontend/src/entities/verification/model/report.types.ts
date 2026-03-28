/**
 * @entity verification/report
 * 최종 가심사 레포트 생성을 위한 API 요청 데이터 규격입니다.
 */

/** 세대원 정보 */
export interface HouseholdMember {
  name: string | null;
  residentRegistrationNumber?: string | null;
}

/** 배우자 정보 */
export interface Spouse {
  exists: boolean;
  name: string | null;
  residentRegistrationNumber?: string | null;
}

/** 임대보증금 항목 정보 */
export interface DepositItem {
  depositDate: string | null;
  depositAmount: number | null;
}

/** 선순위 권리 정보 */
export interface SeniorRight {
  maximumClaimAmount: number | null;
}

/** 층별 현황 정보 */
export interface FloorStatus {
  floor: string | null;
  usage: string | null;
  area: number | null;
}

/** 매도인/매수인 정보 */
export interface PartyInfo {
  name: string | null;
}

/** 이사 세대 정보 */
export interface MoveInHousehold {
  headOfHouseholdName: string | null;
  moveInDate: string | null;
}

/** 세목별 과세 정보 */
export interface TaxItem {
  taxItemName: string | null;
  taxAmount: number | null;
  remark: string | null;
}

/** 공통 리포트 입력 필드 (Single Flat DTO) */
export interface ReportInput {
  // 1. 공통 인적자원 및 기본 정보
  headOfHouseholdName: string | null;
  name: string | null;
  residentRegistrationNumber: string | null;
  employmentType: 'EMPLOYEE' | 'SELF_EMPLOYED';
  householdMembers: HouseholdMember[] | null;
  currentAddress: string | null;
  moveInHouseholds: MoveInHousehold[] | null;
  spouse: Spouse | null;
  
  // 2. 부동산/건물 정보
  registrationType: string | null;
  buildingType: string | null;
  hasDongho: boolean | null;
  lotAddress: string | null;
  hasLandRightCause: boolean | null;
  hasOwnershipTransferClaim: boolean | null;
  hasTrustRegistration: boolean | null;
  ownerName: string | null;
  depositAmountList: DepositItem[] | null;
  seniorRights: SeniorRight[] | null;
  isViolationBuilding: boolean | null;
  mainUsage: string | null;
  floorStatusList: FloorStatus[] | null;
  propertyAddress: string | null;
  salePrice: number | null;
  specialTerms: string | null;
  seller: PartyInfo | null;
  buyer: PartyInfo | null;
  inspectionAddress: string | null;
  collateralMarketPrice: number | null;
  
  // 3. 재직/소득 (근로자용)
  representativeName: boolean | null;
  hasCompanySeal: boolean | null;
  subscriberType: string | null;
  latestAcquisitionDate: string | null;
  latestLossDate: string | null;
  incomeRecipientName: string | null;
  incomeRecipientResidentRegistrationNumber: string | null;
  workPeriod: string | null;
  annualIncomeTotal: number | null;
  
  // 4. 재직/소득 (자영업자용)
  businessName: string | null;
  businessRegistrationNumber: string | null;
  incomeYear: string | null;
  incomeAmount: number | null;
  determinedTaxAmount: number | null;
  corporateRegistrationNumber: string | null;
  taxableSalesAmount: number | null;
  
  // 5. 세금 및 전산 정보
  taxItems: TaxItem[] | null;
  manualReviewRequired: boolean | null;
  registrationNumber: string | null;
  identifierNumber: string | null;
  
  // 6. 금융/마이데이터 정보
  totalRemainingLoanBalance: number | null;
  monthlyRepaymentAmount: number | null;
  creditRating: string | null;
  annualPrincipalAndInterestRepayment: number | null;
  loanPurpose: string | null;
  ownedHouseCount: number | null;
}

/** 
 * 최종 API 요청 DTO (최상위) 
 */
export interface ReportRequestPayload {
  consultationId: string;
  reportInput: ReportInput;
}
