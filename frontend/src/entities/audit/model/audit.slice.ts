import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VerificationServerResponse } from '@/entities/verification/model/types';
import { MyDataResDto } from '@/entities/audit/model/types';

export type SseAuditStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export interface AuditState {
  isSseConnected: boolean;
  isAllAuditDone: boolean;

  currentMessage: string;

  steps: {
    ocr: SseAuditStatus;
    credit: SseAuditStatus;
    loanHistory: SseAuditStatus;
    houseAudit: SseAuditStatus;
  };

  data: {
    ocrData: VerificationServerResponse | null;
    houseAuditData: any | null;
    creditData: any | null;
    loanData: any | null;
  };

  errorMessages: string[];
}

const initialState: AuditState = {
  isSseConnected: false,
  isAllAuditDone: false,
  currentMessage: '연결 대기 중...',
  steps: {
    ocr: 'IDLE',
    credit: 'IDLE',
    loanHistory: 'IDLE',
    houseAudit: 'IDLE',
  },
  data: {
    ocrData: null,
    houseAuditData: null,
    creditData: null,
    loanData: null,
  },
  errorMessages: [],
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setSseConnected: (state, action: PayloadAction<boolean>) => {
      state.isSseConnected = action.payload;
      state.currentMessage = action.payload ? 'SSE 연결 성공' : '연결 대기 중...';
    },
    setAllAuditDone: (state, action: PayloadAction<boolean>) => {
      state.isAllAuditDone = action.payload;
      state.currentMessage = '모든 심사가 완료되었습니다.';
    },
    setCurrentMessage: (state, action: PayloadAction<string>) => {
      state.currentMessage = action.payload;
    },
    updateStepStatus: (state, action: PayloadAction<{ step: keyof AuditState['steps']; status: SseAuditStatus; message?: string }>) => {
      state.steps[action.payload.step] = action.payload.status;
      if (action.payload.message) {
        state.currentMessage = action.payload.message;
      }
    },
    setOcrData: (state, action: PayloadAction<VerificationServerResponse>) => {
      state.data.ocrData = action.payload;
    },
    setHouseAuditData: (state, action: PayloadAction<any>) => {
      state.data.houseAuditData = action.payload;
    },
    setCreditData: (state, action: PayloadAction<Partial<MyDataResDto>>) => {
      state.data.creditData = { ...state.data.creditData, ...action.payload } as MyDataResDto;
    },
    setLoanData: (state, action: PayloadAction<Partial<MyDataResDto>>) => {
      state.data.loanData = { ...state.data.loanData, ...action.payload } as MyDataResDto;
    },
    addErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessages.push(action.payload);
      state.currentMessage = action.payload;
    },
    resetAuditState: () => initialState,
  },
});

export const {
  setSseConnected,
  setAllAuditDone,
  setCurrentMessage,
  updateStepStatus,
  setOcrData,
  setHouseAuditData,
  setCreditData,
  setLoanData,
  addErrorMessage,
  resetAuditState
} = auditSlice.actions;

export default auditSlice.reducer;