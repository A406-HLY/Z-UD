import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';

/**
 * 공통 Axios 인스턴스
 * - baseURL: 환경 변수에서 로드
 * - timeout: 10초 기본값
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * - 토큰 주입 등 공통 요청 전처리 담당
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: Redux or localStorage에서 토큰 가져와 헤더에 주입
    // const token = localStorage.getItem('access_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * - 공통 에러 핸들링 담당 (예: 401 권한 없음 처리 등)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // TODO: 에러 통합 모달 띄우기, 토큰 만료 시 리프레시 로직 등
    if (error.response?.status === 401) {
      console.error('인증 에러: 로그인이 필요합니다.');
    }
    return Promise.reject(error);
  }
);
