

export interface CalculationField {
  value: string | number | boolean | null;
  reason: string;
  usedArticles: string[];
}

export interface ReviewItem {
  fieldKey?: string;
  name_ko: string;
  inputValue: string | number | boolean | null;
  result: '승인' | '반려' | '검토' | '자료 보완 요망' | '검토 요망' | '상관 없음';
  reason: string;
  usedArticles: string[];
  isRequired?: boolean;
  excludedFromFinal?: boolean;
}

export interface LoanProduct {
  productCode: string;
  productName: string;
  forCalculate: {
    collateralMarketPrice: CalculationField;
    maximumClaimAmount: CalculationField;
    totalRemainingLoanBalance: CalculationField;
    LTVRatio: CalculationField & { regulationRegion: string; ownedHouseCountApplied: number | null };
    annualIncomeTotal: CalculationField;
    annualPrincipalAndInterestRepayment: CalculationField;
    DSRRatio: CalculationField;
  };
  forReport: {
    fieldResults: ReviewItem[];
    summary: {
      finalResult: string;
      calculatedAmount?: number | null;
      reason: string;
      keyApprovalReasons: string[];
      keyRejectReasons: string[];
      keyReviewReasons: string[];
    };
  };
}

export interface ConsultationResponse {
  consultationId: string;
  status: string;
  result: {
    consultationId: string;
    products: LoanProduct[];
  };
}

export interface LimitParam {
  label: string;
  value: string;
  reason?: string;
  usedArticles?: string[];
}

export interface ProcessedReviewItem extends ReviewItem {
  key: string;
  value: string | number | boolean | null;
  matched_articles: string[];
  isRequired: boolean;
  excludedFromFinal: boolean;
}

export interface ProcessedProduct {
  productKey: string;
  productName: string;
  isApproved: boolean;
  finalResult: string;
  finalReason: string;
  ltvLimit: number | null;
  dsrLimit: number | null;
  calculatedLimit: number;
  ltvArticles: string[];
  dsrArticles: string[];
  limitParams: LimitParam[];
  items: ProcessedReviewItem[];
  summary: {
    keyApprovalReasons: string[];
    keyRejectReasons: string[];
    keyReviewReasons: string[];
  };
}