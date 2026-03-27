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
  withCredentials: true, // (Why) 세션 쿠키(ZUD_SESSION)를 모든 요청에 자동으로 포함시키기 위함입니다.
  headers: {
    'Content-Type': 'application/json',
  },
});

/** API 공통 에러 규격 */
interface ApiStatusError {
  status: string;
  message: string;
}

// === 의존성 주입(DI)을 위한 내부 상태 ===
let getAccessToken: () => string | undefined = () => undefined;
let onTokenUpdate: (token: string) => void = () => {};
let onTokenReissue: () => Promise<string | undefined> = async () => undefined;
let onLogout: () => void = () => {};

/**
 * 외부(App 계층)에서 Axios 인터셉터 내부 로직에 필요한 의존성을 주입합니다.
 * (Why) shared 계층이 상위 계층인 app/store 및 features를 직접 참조하는 순환 참조(FSD 위반)를 방지합니다.
 */
export const setupAxiosInterceptors = (config: {
  getAccessToken: () => string | undefined;
  onTokenUpdate: (token: string) => void;
  onTokenReissue: () => Promise<string | undefined>;
  onLogout: () => void;
}) => {
  getAccessToken = config.getAccessToken;
  onTokenUpdate = config.onTokenUpdate;
  onTokenReissue = config.onTokenReissue;
  onLogout = config.onLogout;

  /**
   * 요청 인터셉터
   */
  apiClient.interceptors.request.use(
    (axiosConfig: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      
      if (token && axiosConfig.headers) {
        axiosConfig.headers.Authorization = `Bearer ${token}`;
      }
      return axiosConfig;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  /**
   * 응답 인터셉터
   */
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      const authHeader = response.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        onTokenUpdate(token);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const responseData = error.response?.data as ApiResponse<unknown>;
      const errorCode = (responseData?.error as unknown as ApiStatusError)?.status;

      if (
        error.response?.status === 401 &&
        (errorCode === 'AU-001' || errorCode === 'AU-003') &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const newToken = await onTokenReissue();
          if (newToken && originalRequest.headers) {
            onTokenUpdate(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (reissueError) {
          console.error('세션 만료: 다시 로그인해주세요.');
          onLogout();
          
          window.location.href = '/login';
          return Promise.reject(reissueError);
        }
      }

      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error('인증 에러 (401): 로그인이 필요하거나 세션 만료되었습니다.');
            break;
          case 403:
            console.error('권한 에러 (403): 접근 권한이 없습니다.');
            break;
          case 500:
            console.error('서버 에러 (500): 시스템 장애가 발생했습니다. 관리자에게 문의하세요.');
            break;
          default:
            console.error(`API 에러 (${error.response.status}):`, responseData?.error?.message || error.message);
        }
      } else {
        console.error('네트워크 에러: 서버에 연결할 수 없습니다.');
      }

      return Promise.reject(error);
    }
  );
};
