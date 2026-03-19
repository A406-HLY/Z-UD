/**
 * 시스템 사용자(상담원) 도메인 타입
 */
export interface User {
  id: string;      // 고유 ID
  username: string; // 이름 (예: 고싸피)
  employeeId: string; // 사번 (예: 1234567)
  branchName: string; // 지점명 (예: 서울 역삼 지점)
  role: string;    // 역할
}

/**
 * 현재 로그인한 사용자 정보 (Mock용)
 */
export const MOCK_CURRENT_USER: User = {
  id: 'user-1',
  username: 'OOO',
  employeeId: '1234567',
  branchName: '싸피은행 서울 역삼 지점',
  role: 'LOAN_OFFICER',
};
