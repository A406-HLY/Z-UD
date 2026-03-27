/**
 * @entity review
 * 심사 결과 데이터 타입 명세서
 */

// 1. 어떤 타입의 value가 와도 수용할 수 있는 공통 아이템 구조
export interface ReviewItem {
  name_ko: string;
  value: unknown; // 타입 안정성을 위해 무분별한 any 대신 unknown 적용
  matched_articles: string[]; // ["제3조", "제1조"] 
  result: '승인' | '거절' | '자료 보완 요망' | '검토 요망' | '상관 없음';
  reason: string;
}

// 1-1. 상품 메타 데이터를 위한 간소화된 아이템 구조 (결과/사유 생략 가능)
export interface LoanMetaItem {
  name_ko: string;
  value: unknown;
  search_query?: string;
  matched_articles?: string[];
}

// 2. 한도 상세 정보 타입
export interface LtvLoanLimit {
  collateralMarketPrice: number;
  LTVRatio: string;
  maximumClaimAmount: number;
  totalRemainingLoanBalance: number;
  value: number;
}

export interface DsrLoanLimit {
  DSRRatio: string;
  annualIncomeTotal: number;
  annualPrincipalAndInterestRepayment: number;
  interestRate: string;
  stressRateAdjustment: string;
  stressDSR: string;
  repaymentPeriodYears: number;
  value: number;
}

// 3. 대출 상품 구조 (계층형)
export interface LoanProduct {
  productName?: string;
  interestRate?: string;
  repaymentPeriod?: string;
  stressDSR?: LoanMetaItem; // (New) 스트레스 DSR 메타 정보
  ltvBasedLoanLimit?: LtvLoanLimit;
  dsrBasedLoanLimit?: DsrLoanLimit;
  aiResults: Record<string, ReviewItem>; // 심사 조항들은 이 객체 내부로 그룹화
}

// 4. API 전체 응답 최상위 구조
export interface ConsultationResponse {
  consultationId: string;
  result: Record<string, LoanProduct>;
}

// === 프론트엔드 UI를 위한 가공(뷰 모델) 타입 확장 ===

export interface ProcessedReviewItem extends ReviewItem {
  key: string; 
}

export interface ProcessedProduct {
  productKey: string;
  productName?: string;
  isApproved: boolean;
  ltvLimit: number;
  dsrLimit: number;
  calculatedLimit: number;
  limitParams: Array<{ label: string; value: string }>;
  items: ProcessedReviewItem[];
}
