import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';

/**
 * 전역 Redux 스토어
 * - 도메인/워크플로우 별 Slice 생성 후 이 파일에 등록합니다.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== 'production', // 개발 환경에서만 DevTools 활성화
});

// RootState와 AppDispatch 타입 추론
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
