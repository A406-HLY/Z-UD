import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../../entities/user';

/**
 * 인증 및 세션 관리 Slice
 * - 가이드라인 15. 전역 클라이언트 상태 규칙을 준수합니다.
 * - 로그인한 행원의 세션 정보를 관리합니다.
 */

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * 유저 정보 설정 (로그인 성공 시 호출)
     */
    setCredentials: (
      state,
      action: PayloadAction<{ user: User }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    /**
     * 액세스 토큰만 갱신 (인터셉터 재발급 시 호출)
     */
    updateToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.accessToken = action.payload;
      }
    },
    /**
     * 인증 정보 초기화 (로그아웃 시 호출)
     */
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateToken, logout } = authSlice.actions;

export default authSlice.reducer;
