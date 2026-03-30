

export interface HouseAuditResponseDto {
  success: boolean;
  data: {
    illegalBuilding: boolean;
    nearestBranch: {
      currentBranchIsNearest: boolean;
      currentBranchName: string;
      currentBranchAddress: string;
      currentBranchDistanceMeter: number;
      nearestBranchName: string;
      nearestBranchAddress: string;
      nearestBranchDistanceMeter: number;
      message: string;
    };
    supportedHouseType: boolean;
    housePrice: {
      price: number;
      priceType: string;
      message: string;
    };
  };
}

export interface HouseAuditRequestDto {
  illegalBuilding: boolean;
  houseType: string;
  propertyAddress: string;
}

export interface MyDataReqDto {
  customerName: string;
}

export interface MyDataLoanProduct {
  accountNo: string;
  accountName: string;
  loanBalance: number;
  remainingLoanBalance: number;
  annualPrincipalAndInterestRepayment: number;
}

export interface MyDataResDto {
  userId: string;
  ratingName: string;
  totalLoanBalance: number;
  totalRemainingLoanBalance: number;
  totalAnnualPrincipalAndInterestRepayment: number;
  loanProducts: MyDataLoanProduct[];
}

export type AuditStatus = 'SUCCESS' | 'WARNING' | 'ERROR' | 'LOADING';

export interface AuditSummaryItem {
  id: string;
  title: string;
  summary: string;
  status: AuditStatus;
  message?: string;
  actionLabel?: string;
  details?: unknown;
}