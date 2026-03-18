import { apiClient } from '../../../shared/api/client';
import { ApiResponse, LoginResponseData } from '../../../entities/user';

/**
 * 인증 관련 API 함수
 * - 가이드라인 14. API 연동 규칙을 준수하여 apiClient를 사용합니다.
 */

/** 로그인 요청 데이터 규격 (사번 기반) */
export interface LoginRequest {
  employeeNumber: string;
  password: string;
}

/**
 * 행원 세션 로그인 요청
 * @param data 사번 및 비밀번호
 * @returns 세션 생성 결과 및 유저 상세 정보
 */
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', data);
  return response.data;
};
