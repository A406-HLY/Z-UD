import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthSync } from '../model/use-auth-sync';

/**
 * @feature Auth/AuthInitializer
 * (Why) 앱 전체의 인증 상태를 초기화하고 동기화하는 컴포넌트입니다.
 * react-router의 레이아웃으로 사용되어 Provider 내부에서 useLocation 등을 안전하게 사용할 수 있습니다.
 */
export const AuthInitializer: React.FC = () => {
  useAuthSync();
  return <Outlet />;
};
