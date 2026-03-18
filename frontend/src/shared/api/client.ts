import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { ApiResponse } from '../../entities/user';

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
 * - 모든 API 요청이 나가기 직전에 공통 처리를 담당합니다.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    /**
     * TODO: 백엔드와 협의 필요 - 인증 토큰 저장 및 전달 방식
     * 1. 토큰 저장소 결정 (localStorage, sessionStorage, cookie 등)
     * 2. 헤더 키 명칭 결정 (Authorization: Bearer <token> 등)
     */
    const token = localStorage.getItem('access_token'); // 임시 키 이름
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * - 모든 API 응답이 들어온 직후 공통 에러 핸들링을 담당합니다.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    /**
     * TODO: 백엔드와 협의 필요 - 성공 응답 규격 확인
     * response.data가 ApiResponse<T> 형태를 따르는지 확인
     */
    return response;
  },
  (error: AxiosError) => {
    const responseData = error.response?.data as ApiResponse<unknown>;
    
    /**
     * TODO: 백엔드와 협의 필요 - 공통 에러 코드 처리 정책
     */
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 인증 에러: 세션 만료 처리 또는 로그인 페이지 리다이렉트
          console.error('인증 에러 (401): 로그인이 필요하거나 세션이 만료되었습니다.');
          // TODO: 전역 로그아웃 함수 호출 (store/slices/auth.slice.ts 의 logout 액션 등)
          // window.location.href = '/login'; 
          break;
          
        case 403:
          // 권한 에러: 접근 권한이 없는 기능 호출 시
          console.error('권한 에러 (403): 접근 권한이 없습니다.');
          break;
          
        case 500:
          // 서버 내부 에러: 시스템 장애 알림
          console.error('서버 에러 (500): 시스템 장애가 발생했습니다. 관리자에게 문의하세요.');
          break;
          
        default:
          // 기타 에러 처리
          console.error(`API 에러 (${error.response.status}):`, responseData?.error?.message || error.message);
      }
    } else {
      // 네트워크 연결 실패 등 서버 응답이 없는 경우
      console.error('네트워크 에러: 서버에 연결할 수 없습니다.');
    }
    
    return Promise.reject(error);
  }
);
