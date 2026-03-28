import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCredentials } from '@/app/store/slices/auth.slice';
import { safeReissue } from '@/shared/api/client';
import { mapLoginResponseToUser } from '@/entities/user/model/user.mapper';
import { LoginResponseData } from '@/entities/user/model/user.types';

/**
 * @feature Auth/useAuthSync
 * (Why) 'Memory-only' 보안 정책으로 인해 새 창이나 새로고침 시 증발하는 인증 상태를 
 * 브라우저의 HttpOnly 쿠키(Refresh Token)를 이용하여 자동으로 복구(Silent Reissue)하는 로직입니다.
 * 백엔드 응답 규격이 login과 통일됨에 따라 동일한 매퍼를 사용하여 상태를 복구합니다.
 */
export const useAuthSync = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (location.pathname === '/login' || isAuthenticated) {
      return;
    }

    const initializeAuth = async () => {
      try {
        const response = await safeReissue();
        
        if (response.data.success && response.data.data) {
          const reissueData = response.data.data;
          
          // (Why) 백엔드가 로그인과 규격을 맞췄다면 Authorization 헤더에 토큰이 들어옵니다.
          // 본문(reissueData.accessToken)에도 있을 수 있으므로 양쪽 모두에서 추출을 시도합니다.
          const authHeader = response.headers['authorization'];
          const accessToken = (reissueData as unknown as Record<string, unknown>).accessToken as string 
            || authHeader?.replace('Bearer ', '') 
            || '';
          
          if (accessToken) {
            // (Why) 백엔드 응답 규격이 login과 동일하므로(userInfoDto 포함) 검증된 매퍼를 사용합니다.
            const user = mapLoginResponseToUser(reissueData as unknown as LoginResponseData, accessToken);
            dispatch(setCredentials({ user }));
            console.log('[AuthSync] SSO Authentication successfully restored.');
          } else {
            console.warn('[AuthSync] Reissue succeeded but AccessToken was not found in Header or Body.');
          }
        }
      } catch (err) {
        console.warn('[AuthSync] No active session found or session expired.', err);
      }
    };

    initializeAuth();
  }, [dispatch, location.pathname, isAuthenticated]);
};


