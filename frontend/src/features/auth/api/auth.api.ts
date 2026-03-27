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
 * 행원 로그인 요청 (SSO 중계 방식)
 * @param data 사번 및 비밀번호
 * @returns 세션 정보 및 유저 상세 정보 (헤더 포함을 위해 AxiosResponse 반환)
 */
export const login = async (data: LoginRequest) => {
  return await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', data);
};

/**
 * Access Token 재발급 요청
 * - HttpOnly 쿠키의 Refresh Token을 사용하므로 별도 바디 없음
 */
export const reissueToken = async () => {
  return await apiClient.post<ApiResponse<LoginResponseData>>('/auth/reissue');
};

/**
 * 로그아웃 요청
 * - 서버 세션 및 토큰을 무효화합니다.
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
  return response.data;
};
