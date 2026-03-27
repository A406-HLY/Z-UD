import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCredentials } from '@/app/store/slices/auth.slice';
import { reissueToken } from '../api/auth.api';
import { mapLoginResponseToUser } from '@/entities/user/model/user.mapper';

/**
 * @feature Auth/useAuthSync
 * (Why) 'Memory-only' 보안 정책으로 인해 새 창이나 새로고침 시 증발하는 인증 상태를 
 * 브라우저의 HttpOnly 쿠키(Refresh Token)를 이용하여 자동으로 복구(Silent Reissue)하는 로직입니다.
 */
export const useAuthSync = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // (Why) 로그인 페이지인 경우나 이미 인증된 경우 중복 요청을 방지합니다.
    if (location.pathname === '/login' || isAuthenticated) {
      return;
    }

    const initializeAuth = async () => {
      try {
        // (Why) 앱 마운트 시점에 토큰이 없으므로 서버에 재발급을 요청합니다.
        // 서버에 유효한 Refresh Token 쿠키가 있다면 새로운 Access Token을 반환합니다.
        const response = await reissueToken();
        
        if (response.data.success) {
          const authHeader = response.headers['authorization'];
          const accessToken = authHeader?.replace('Bearer ', '') || '';
          
          if (accessToken) {
            // (Note) 매퍼를 통해 백엔드 데이터를 프론트엔드 모델로 변환하여 Redux에 저장합니다.
            const user = mapLoginResponseToUser(response.data.data, accessToken);
            dispatch(setCredentials({ user }));
            console.log('[AuthSync] SSO Authentication successfully restored.');
          }
        }
      } catch {
        // (Note) 세션이 실제 만료된 경우 (쿠키 없음/만료) 에러가 발생하며, 이때는 자연스럽게 비로그인 상태를 유지합니다.
        console.warn('[AuthSync] No active session found or session expired.');
      }
    };

    initializeAuth();
  }, [dispatch, location.pathname, isAuthenticated]);
};
