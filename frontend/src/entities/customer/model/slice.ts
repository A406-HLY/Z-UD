import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, INITIAL_CUSTOMER_STATE } from './types';

interface CustomerState {
  data: Customer;
  isPollingActive: boolean;
}

const initialState: CustomerState = {
  data: INITIAL_CUSTOMER_STATE,
  isPollingActive: false,
};

/**
 * @entity Customer
 * 고객 정보 및 상담 진행 상태를 전역으로 관리하는 슬라이스입니다.
 * (Why) 상담 ID(counselId)와 서류 감지 상태는 여러 위젯에서 공통으로 참조해야 하므로 전역 상태로 관리합니다.
 */
export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    /** 
     * 상담 ID 설정 
     * (Why) 최초 저장 시 생성된 UUID를 전역으로 공유하기 위함입니다.
     */
    setCounselId: (state, action: PayloadAction<string>) => {
      state.data.counselId = action.payload;
    },
    
    /** 
     * 서류 감지(폴링) 상태 제어 
     * (Why) 여러 위젯(감지 버튼, 서류 뷰어 등)이 동일한 동기화 상태를 바라보게 하기 위함입니다.
     */
    setIsPollingActive: (state, action: PayloadAction<boolean>) => {
      state.isPollingActive = action.payload;
    },
    
    /** 
     * 고객 정보 폼 데이터 업데이트 
     */
    updateCustomerData: (state, action: PayloadAction<Partial<Customer>>) => {
      state.data = { ...state.data, ...action.payload };
    },
    
    /** 상태 초기화 (상담 종료 시 등 사용) */
    resetCustomerState: (state) => {
      state.data = INITIAL_CUSTOMER_STATE;
      state.isPollingActive = false;
    },
  },
});

export const { 
  setCounselId, 
  setIsPollingActive, 
  updateCustomerData, 
  resetCustomerState 
} = customerSlice.actions;

export default customerSlice.reducer;
