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

/** 공통 리포트 입력 필드 (Base) */
export interface BaseReportInput {
  headOfHouseholdName: string | null; // (API) 세대주 성명 추가
  name: string | null;
  residentRegistrationNumber: string | null;
  phoneNumber: string | null;
  targetLoanAmount: number | null;
  loanPurpose: string | null;
  ownedHouseCount: number | null;
  householdMembers: HouseholdMember[] | null;
  currentAddress: string | null;
  moveInHouseholds: MoveInHousehold[] | null; // (API) moveInDate에서 배열 구조로 변경
  spouse: Spouse | null;
  registrationType: string | null;
  hasDongho: boolean | null;
  buildingType: string | null;
  lotAddress: string | null;
  hasLandRightCause: boolean | null;
  hasOwnershipTransferClaim: boolean | null;
  hasTrustRegistration: boolean | null;
  ownerName: string | null;
  depositAmountList: DepositItem[] | null; // (API) 단일 객체에서 배열 구조로 변경
  seniorRights: SeniorRight[] | null;
  isViolationBuilding: boolean | null;
  mainUsage: string | null;
  floorStatusList: FloorStatus[] | null;
  propertyAddress: string | null;
  salePrice: number | null;
  specialTerms: string | null;
  seller: PartyInfo | null;
  buyer: PartyInfo | null;
  taxItems: TaxItem[] | null;
  manualReviewRequired: boolean | null;
  registrationNumber: string | null; // (API) 전산관리번호 추가
  identifierNumber: string | null;     // (API) 식별번호 추가
  inspectionAddress: string | null;    // (API) 조사주소 추가
  collateralMarketPrice: number | null;
  totalRemainingLoanBalance: number | null; // (Fix) 오타 수정 및 JSON 규격 정렬
  monthlyRepaymentAmount: number | null;    // (API) 월상환액 추가
  creditRating: string | null;
  annualPrincipalAndInterestRepayment: number | null;
}

/** 개인사업자 전용 입력 필드 */
export interface SelfEmployedReportInput extends BaseReportInput {
  employmentType: 'SELF_EMPLOYED';
  businessName: string | null;
  businessRegistrationNumber: string | null;
  incomeYear: string | null;
  incomeAmount: number | null;
  determinedTaxAmount: number | null;      // (API) 결정세액 추가
  corporateRegistrationNumber: string | null; // (API) 법인등록번호 추가
  taxableSalesAmount: number | null;
}

/** 근로자 전용 입력 필드 */
export interface EmployeeReportInput extends BaseReportInput {
  employmentType: 'EMPLOYEE';
  representativeName: boolean | null; // (Rename) JSON 규격 정렬
  hasCompanySeal: boolean | null;
  subscriberType: string | null;
  latestAcquisitionDate: string | null;
  latestLossDate: string | null;
  incomeRecipientName: string | null; // (API) 소득수령인 성명 추가
  incomeRecipientResidentRegistrationNumber: string | null; // (API) 소득수령인 주민번호 추가
  workPeriod: string | null;
  annualIncomeTotal: number | null;
}

/** 가입자 형태에 따른 유니온 타입 (Discriminated Union) */
export type ReportInput = SelfEmployedReportInput | EmployeeReportInput;

/** 
 * 최종 API 요청 DTO (최상위) 
 */
export interface ReportRequestPayload {
  consultationId: string;
  reportInput: ReportInput;
}
