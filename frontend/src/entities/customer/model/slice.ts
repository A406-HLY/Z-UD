import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, INITIAL_CUSTOMER_STATE } from './types';

/**
 * @entity customer/model/slice
 * 고객 입력 폼 데이터 및 폴링 상태를 관리합니다.
 * (Why: 단일 서류 오류 시 OCR 데이터와 대조하기 위한 '원천 정답지' 역할을 수행합니다.)
 */
export interface CustomerState {
  data: Customer;
  isPollingActive: boolean;
  isSubmitting: boolean;
}

const initialState: CustomerState = {
  // 테스트를 위해 초기값을 세팅해둡니다. (실제 운영시 INITIAL_CUSTOMER_STATE 사용)
  data: {
    ...INITIAL_CUSTOMER_STATE,
  },
  isPollingActive: false,
  isSubmitting: false,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    updateCustomerData: (state, action: PayloadAction<Partial<Customer>>) => {
      state.data = { ...state.data, ...action.payload };
    },
    setCounselId: (state, action: PayloadAction<string>) => {
      state.data.counselId = action.payload;
    },
    setIsPollingActive: (state, action: PayloadAction<boolean>) => {
      state.isPollingActive = action.payload;
    },
    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
  },
});

export const { updateCustomerData, setCounselId, setIsPollingActive, setIsSubmitting } = customerSlice.actions;
export default customerSlice.reducer;
