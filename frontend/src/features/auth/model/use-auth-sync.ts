import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCredentials } from '@/app/store/slices/auth.slice';
import { safeReissue } from '@/shared/api/client';
import { mapLoginResponseToUser } from '@/entities/user/model/user.mapper';
import { LoginResponseData } from '@/entities/user/model/user.types';

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

          const authHeader = response.headers['authorization'];
          const accessToken = (reissueData as unknown as Record<string, unknown>).accessToken as string
            || authHeader?.replace('Bearer ', '')
            || '';

          if (accessToken) {

            const user = mapLoginResponseToUser(reissueData as unknown as LoginResponseData, accessToken);
            dispatch(setCredentials({ user }));

          } else {

          }
        }
      } catch (err) {

      }
    };

    initializeAuth();
  }, [dispatch, location.pathname, isAuthenticated]);
};