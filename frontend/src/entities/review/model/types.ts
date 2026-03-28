/**
 * @entity review
 * 심사 결과 데이터 타입 명세서 (백엔드 V2 규격 준수)
 */

// 1. 공통 데이터 필드 구조 (값, 사유, 근거 조항 포함)
export interface CalculationField {
  value: any; // number | string | boolean | null;
  reason: string;
  usedArticles: string[];
}

// 2. 심사 결과 아이템 (aiResults 및 fieldResults 용)
export interface ReviewItem {
  fieldKey?: string;
  name_ko: string;
  inputValue: any; 
  result: '승인' | '반려' | '검토' | '자료 보완 요망' | '검토 요망' | '상관 없음';
  reason: string;
  usedArticles: string[]; 
  isRequired?: boolean;
  excludedFromFinal?: boolean;
}

// 3. 백엔드 대출 상품 구조 (계층형)
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
      reason: string;
      keyApprovalReasons: string[];
      keyRejectReasons: string[];
      keyReviewReasons: string[];
    };
  };
}

// 4. API 전체 응답 최상위 구조
export interface ConsultationResponse {
  consultationId: string;
  status: string;
  result: {
    consultationId: string;
    products: LoanProduct[];
  };
}

// === 프론트엔드 UI를 위한 가공(뷰 모델) 타입 확장 ===

export interface ProcessedReviewItem extends ReviewItem {
  key: string; 
  value: any; // inputValue를 value로 별칭 매핑하여 기존 UI 소품(Prop) 호환성 유지
  matched_articles: string[]; // usedArticles를 matched_articles로 별칭 매핑
}

export interface ProcessedProduct {
  productKey: string;
  productName: string;
  isApproved: boolean;
  finalResult: string; // "승인", "반려", "검표" 등
  finalReason: string;
  ltvLimit: number; // % 값
  dsrLimit: number; // % 값
  calculatedLimit: number; // 최종 한도 금액 (원)
  limitParams: Array<{ label: string; value: string }>;
  items: ProcessedReviewItem[];
  summary: {
    keyApprovalReasons: string[];
    keyRejectReasons: string[];
    keyReviewReasons: string[];
  };
}
