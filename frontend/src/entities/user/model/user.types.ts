/**
 * 행원 도메인 관련 타입 정의
 * - 가이드라인에 따라 백엔드 응답 타입(Response)과 프론트엔드 UI 모델(User)을 분리합니다.
 */

/** 백엔드 로그인 API 응답 데이터 (snake_case) */
export interface LoginResponseData {
  user_id: number;
  employee_number: string;
  name: string;
  branch_id: number;
  branch_name: string;
  session_expiry: string;
}

/** 필드별 상세 에러 규격 */
export interface ApiFieldError {
  field: string;
  message: string;
  rejected_value?: string | number | boolean;
}

/** 공통 API 응답 규격 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: {
    status: string;
    message: string;
    method: string;
    request_uri: string;
    errors: ApiFieldError[];
  } | null;
  timestamp: string;
}

/** 프론트엔드 내부에서 사용할 유저 모델 (camelCase) */
export interface User {
  id: number;
  employeeNumber: string;
  name: string;
  branchId: number;
  branchName: string;
  sessionExpiry: Date;
}

/** 로그인 정보를 포함한 인증 상태 타입 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
