import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConsultationResponse } from './types';

// RootStateLike: store 의존성 사이클 방지를 위한 로컬 타입
export interface RootStateLike {
  review: ReviewState;
}

export interface ReviewState {
  data: ConsultationResponse | null;
  selectedProductKey: string | null;
  selectedArticle: string[] | null; // PDF 뷰어 연동용 조항 데이터 (문자열 배열)
}

const initialState: ReviewState = {
  data: null,
  selectedProductKey: null,
  selectedArticle: null,
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    // API 데이터 세팅
    setReviewData: (state, action: PayloadAction<ConsultationResponse>) => {
      state.data = action.payload;
    },
    // 선택된 상품 탭 변경
    setSelectedProductKey: (state, action: PayloadAction<string>) => {
      state.selectedProductKey = action.payload;
      state.selectedArticle = null; // 탭 전환 시 조항 클리어
    },
    // 우측 PDF 영역으로 전달할 조항 배열 세팅 (ex: ["제3조", "제1조"])
    setSelectedArticle: (state, action: PayloadAction<string[] | null>) => {
      state.selectedArticle = action.payload;
    },
    resetReview: () => initialState,
  },
});

export const { 
  setReviewData, 
  setSelectedProductKey, 
  setSelectedArticle, 
  resetReview 
} = reviewSlice.actions;

export default reviewSlice.reducer;
