import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../../entities/user';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    setCredentials: (
      state,
      action: PayloadAction<{ user: User }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },

    updateToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.accessToken = action.payload;
      }
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, updateToken, logout } = authSlice.actions;

export default authSlice.reducer;