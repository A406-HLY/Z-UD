import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import customerReducer from '@/entities/customer/model/slice';
import auditReducer from '@/entities/audit/model/audit.slice';
import verificationReducer from '@/entities/verification/model/slice';
import reviewReducer from '@/entities/review/model/review.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    audit: auditReducer,
    verification: verificationReducer,
    review: reviewReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;