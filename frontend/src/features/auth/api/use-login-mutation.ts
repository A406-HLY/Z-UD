/**
 * @feature Auth
 * 행원 세션 로그인을 위한 Mutation Hook입니다.
 * 로그인 성공 시 서버 데이터를 매핑하고 Redux Store에 인증 정보를 저장합니다.
 */

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { login, LoginRequest } from './auth.api';
import { ApiResponse, mapLoginResponseToUser } from '../../../entities/user';
import { useAppDispatch } from '../../../app/store/hooks';
import { setCredentials } from '../../../app/store/slices/auth.slice';

export const useLoginMutation = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    /**
     * @param data 사번 및 비밀번호를 포함한 로그인 요청 객체
     */
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // (Why) FSD 규칙에 따라 엔티티 매퍼를 사용하여 UI 모델로 변환 후 전역 상태에 저장함
        const user = mapLoginResponseToUser(response.data);
        dispatch(setCredentials({ user }));

        // (Why) 에이전트 연동을 위해 토큰을 sessionStorage에 저장합니다.
        const respData = response.data as any;
        const token = respData.accessToken;
        
        if (token) {
          sessionStorage.setItem('access_token', token);
          console.log('[Auth] Token stored in sessionStorage');
        } else {
          console.warn('[Auth] accessToken not found in response');
        }
        
        console.log('Login successful:', user.name);
      }
    },
    onError: (error: unknown) => {
      let message = '알 수 없는 오류가 발생했습니다.';
      
      if (error instanceof AxiosError) {
        // (Why) 백엔드 공통 응답 규격(ApiResponse)에 맞춰 에러 메시지를 안전하게 추출함
        const responseData = error.response?.data as ApiResponse<unknown>;
        message = responseData?.error?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      console.error('Login failed:', message);
    },
  });
};
