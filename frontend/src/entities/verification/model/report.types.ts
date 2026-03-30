

export interface HouseholdMember {
  name: string | null;
  residentRegistrationNumber?: string | null;
}

export interface Spouse {
  exists: boolean;
  name: string | null;
  residentRegistrationNumber?: string | null;
}

export interface DepositItem {
  depositDate: string | null;
  depositAmount: number | null;
}

export interface SeniorRight {
  maximumClaimAmount: number | null;
}

export interface FloorStatus {
  floor: string | null;
  usage: string | null;
  area: number | null;
}

export interface PartyInfo {
  name: string | null;
}

export interface MoveInHousehold {
  headOfHouseholdName: string | null;
  moveInDate: string | null;
}

export interface TaxItem {
  taxItemName: string | null;
  taxAmount: number | null;
  remark: string | null;
}

export interface ReportInput {
  headOfHouseholdName: string | null;
  name: string | null;
  residentRegistrationNumber: string | null;
  employmentType: 'EMPLOYEE' | 'SELF_EMPLOYED';
  householdMembers: HouseholdMember[] | null;
  currentAddress: string | null;
  moveInHouseholds: MoveInHousehold[] | null;
  spouse: Spouse | null;

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

  representativeName: boolean | null;
  hasCompanySeal: boolean | null;
  subscriberType: string | null;
  latestAcquisitionDate: string | null;
  latestLossDate: string | null;
  incomeRecipientName: string | null;
  incomeRecipientResidentRegistrationNumber: string | null;
  workPeriod: string | null;
  annualIncomeTotal: number | null;

  businessName: string | null;
  businessRegistrationNumber: string | null;
  incomeYear: string | null;
  incomeAmount: number | null;
  determinedTaxAmount: number | null;
  corporateRegistrationNumber: string | null;
  taxableSalesAmount: number | null;

  taxItems: TaxItem[] | null;
  manualReviewRequired: boolean | null;
  registrationNumber: string | null;
  identifierNumber: string | null;

  totalRemainingLoanBalance: number | null;
  monthlyRepaymentAmount: number | null;
  creditRating: string | null;
  annualPrincipalAndInterestRepayment: number | null;
  loanPurpose: string | null;
  ownedHouseCount: number | null;
  targetLoanAmount: number | null;
  issueDate: string | null;
}

export interface ReportRequestPayload {
  consultationId: string;
  reportInput: ReportInput;
}