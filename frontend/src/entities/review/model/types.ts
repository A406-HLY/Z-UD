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

// 2. 항목 이름(키)이 무엇이든 동적으로 다 받아내는 대출 상품 구조
export type LoanProduct = Record<string, ReviewItem>;

// 3. API 전체 응답 최상위 구조
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
  isApproved: boolean;
  ltvLimit: number;
  dsrLimit: number;
  calculatedLimit: number;
  limitParams: Array<{ label: string; value: string }>;
  items: ProcessedReviewItem[];
}
