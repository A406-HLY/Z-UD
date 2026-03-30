/**
 * @entity review
 * 심사 결과 데이터 타입 명세서 (백엔드 V2 규격 준수)
 */

// 1. 공통 데이터 필드 구조 (값, 사유, 근거 조항 포함)
export interface CalculationField {
  value: string | number | boolean | null;
  reason?: string; // (Alias for UI)
  usedArticles: string[];
  explanation?: { summary: string }; // New: 백엔드 V2 상세 사유
}

// 2. 심사 결과 아이템 (aiResults 및 fieldResults 용)
export interface ReviewItem {
  fieldKey?: string;
  koreanField?: string; // New: 백엔드 V2 심사 항목 한글명
  name_ko: string;
  inputValue: string | number | boolean | null; 
  result: '승인' | '반려' | '검토' | '자료 보완 요망' | '검토 요망' | '상관 없음'; // UI 호환용 상태 필드
  judgement?: '승인' | '반려' | '검토' | '검토 요망'; // New: 백엔드 V2 심사 결과 상태
  reason?: string; // UI 호환용 사유 필드 (explanation.summary 매핑용)
  explanation?: { summary: string }; // New: 백엔드 V2 상세 요약
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
      calculatedAmount?: number | null;
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

export interface LimitParam {
  label: string;
  value: string;
  reason?: string;         // (Why) 산출 로직 설명
  usedArticles?: string[]; // (Why) 참조 법적 조항
}

export interface ProcessedReviewItem extends ReviewItem {
  key: string; 
  value: string | number | boolean | null; // inputValue를 value로 별칭 매핑하여 기존 UI 소품(Prop) 호환성 유지
  matched_articles: string[]; // usedArticles를 matched_articles로 별칭 매핑
  isRequired: boolean;        // (New) 필수 심사 항목 여부
  excludedFromFinal: boolean; // (New) 최종 결과 제외(참고) 항목 여부
}

export interface ProcessedProduct {
  productKey: string;
  productName: string;
  isApproved: boolean;
  finalResult: string; // "승인", "반려", "검표" 등
  finalReason: string;
  ltvLimit: number | null; // % 값
  dsrLimit: number | null; // % 값
  calculatedLimit: number; // 최종 한도 금액 (원)
  ltvArticles: string[]; // (New) LTV 관련 내규 조항
  dsrArticles: string[]; // (New) DSR 관련 내규 조항
  limitParams: LimitParam[];
  items: ProcessedReviewItem[];
  summary: {
    keyApprovalReasons: string[];
    keyRejectReasons: string[];
    keyReviewReasons: string[];
  };
}
