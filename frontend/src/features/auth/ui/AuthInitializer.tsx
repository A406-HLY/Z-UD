import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthSync } from '../model/use-auth-sync';

export const AuthInitializer: React.FC = () => {
  useAuthSync();
  return <Outlet />;
};