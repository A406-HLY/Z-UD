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

/**
 * 요청 인터셉터
 * - 모든 API 요청이 나가기 직전에 공통 처리를 담당합니다.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    /**
     * (Why) 보안 강화 및 SSO 가이드를 준수하여 Redux 메모리에서 토큰을 가져옵니다.
     * sessionStorage 접근을 지양하고 메모리 상의 토큰만 사용합니다.
     */
    const { store } = await import('@/app/store');
    const token = store.getState().auth.user?.accessToken;
    
    // (Why) 토큰이 존재할 때만 Authorization 헤더를 추가합니다. 
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
    // (Why) 성공 응답 헤더에 Authorization이 포함되어 있다면 최신 토큰으로 Redux 스토어를 갱신합니다.
    const authHeader = response.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // (Why) Memory-only Auth를 위해 Redux를 직접 업데이트함 (순환 참조 방지용 동적 임포트)
      import('@/app/store').then(async ({ store }) => {
        const { updateToken } = await import('@/app/store/slices/auth.slice');
        store.dispatch(updateToken(token));
      }).catch(() => {});
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const responseData = error.response?.data as ApiResponse<unknown>;
    const errorCode = (responseData?.error as unknown as ApiStatusError)?.status;

    /**
     * (Why) 401 인증 에러 발생 시 토큰 재발급을 시도합니다.
     * AU-001: 토큰 유효하지 않음, AU-003: 토큰 없음
     */
    if (
      error.response?.status === 401 &&
      (errorCode === 'AU-001' || errorCode === 'AU-003') &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // (Why) 서버의 reissue 엔드포인트를 호출하여 쿠키 기반 토큰 갱신 시도
        const { reissueToken } = await import('../../features/auth/api/auth.api');
        const reissueResponse = await reissueToken();

        const newToken = reissueResponse.headers['authorization']?.replace('Bearer ', '');
        if (newToken && originalRequest.headers) {
          // (Why) 재발급된 토큰을 Redux 스토어에 동기화
          const { store } = await import('@/app/store');
          const { updateToken } = await import('@/app/store/slices/auth.slice');
          store.dispatch(updateToken(newToken));

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest); // 실패했던 이전 요청 재시도
        }
      } catch (reissueError) {
        console.error('세션 만료: 다시 로그인해주세요.');
        const { store } = await import('@/app/store');
        const { logout } = await import('@/app/store/slices/auth.slice');
        store.dispatch(logout()); // Redux 상태 초기화
        
        window.location.href = '/login';
        return Promise.reject(reissueError);
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('인증 에러 (401): 로그인이 필요하거나 세션이 만료되었습니다.');
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
