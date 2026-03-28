/**
 * 대출 신청 고객 정보 도메인 타입
 */
export interface Customer {
  name: string;        // 고객 성함
  residentRegistrationNumber: string;  // 주민등록번호
  phoneNumber: string; // 전화번호
  loanPurpose: string; // 대출 목적
  employmentType: string; // 근로 형태
  targetLoanAmount: string;  // 희망 금액
  ownedHouseCount: string;     // 보유 주택 개수
  consultationId: string;      // 상담 ID (UUID, String 형식으로 백엔드 규격 통일)
}

/**
 * 초기 고객 정보 상태
 */
export const INITIAL_CUSTOMER_STATE: Customer = {
  name: '홍길동',
  residentRegistrationNumber: '990101-1234567',
  phoneNumber: '010-1234-5678',
  loanPurpose: '주택구입목적',
  employmentType: '직장인',
  targetLoanAmount: '100000000',
  ownedHouseCount: '0',
  consultationId: '',
};
