import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, INITIAL_CUSTOMER_STATE } from './types';

export interface CustomerState {
  data: Customer;
  isPollingActive: boolean;
  isSubmitting: boolean;
}

const initialState: CustomerState = {
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
    setConsultationId: (state, action: PayloadAction<string>) => {
      state.data.consultationId = action.payload;
    },
    setIsPollingActive: (state, action: PayloadAction<boolean>) => {
      state.isPollingActive = action.payload;
    },
    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
  },
});

export const { updateCustomerData, setConsultationId, setIsPollingActive, setIsSubmitting } = customerSlice.actions;
export default customerSlice.reducer;