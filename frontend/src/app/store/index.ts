import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import customerReducer from '@/entities/customer/model/slice';

/**
 * 전역 Redux 스토어
 * - 도메인/워크플로우 별 Slice 생성 후 이 파일에 등록합니다.
 * (Why) FSD 아키텍처에 따라 각 엔터티 레이어에서 정의된 리듀서를 중앙 스토어에 통합하여 관리합니다.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
  },
  devTools: process.env.NODE_ENV !== 'production', // 개발 환경에서만 DevTools 활성화
});

// RootState와 AppDispatch 타입 추론
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
