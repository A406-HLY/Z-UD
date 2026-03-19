/**
 * 대출 신청 고객 정보 도메인 타입
 */
export interface Customer {
  name: string;        // 고객 성함
  personalId: string;  // 주민등록번호
  phoneNumber: string; // 전화번호
  loanPurpose: string; // 대출 목적
  employmentType: string; // 근로 형태
  desiredAmount: string;  // 희망 금액
}

/**
 * 초기 고객 정보 상태
 */
export const INITIAL_CUSTOMER_STATE: Customer = {
  name: '',
  personalId: '',
  phoneNumber: '',
  loanPurpose: '',
  employmentType: '',
  desiredAmount: '',
};
