/**
 * @entity review/config/constants
 * 리뷰(심사) 도메인 내부에서만 사용되는 상수 및 텍스트 정의
 */

export const CALCULATE_LABELS = {
  MARKET_PRICE: '평가 시세',
  MAX_CLAIM_AMOUNT: '채권최고액 합계',
  REMAINING_BALANCE: '기존 대출 잔액',
  APPLIED_LTV: '적용 LTV',
  REGULATION_REGION: '규제 지역',
  ANNUAL_INCOME: '연간 소득 합계',
  ANNUAL_REPAYMENT: '연간 원리금 상환액',
  APPLIED_DSR: '적용 DSR',
} as const;
