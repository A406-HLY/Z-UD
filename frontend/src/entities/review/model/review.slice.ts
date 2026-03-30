import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConsultationResponse } from './types';

export interface RootStateLike {
  review: ReviewState;
}

export interface ReviewState {
  data: ConsultationResponse | null;
  selectedProductKey: string | null;
  selectedArticle: string[] | null;
  loading: boolean;
  error: string | null;
  guidelineUrl: string | null;
}

const initialState: ReviewState = {
  data: null,
  selectedProductKey: null,
  selectedArticle: null,
  loading: false,
  error: null,
  guidelineUrl: null,
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    setReviewData: (state, action: PayloadAction<ConsultationResponse>) => {
      state.data = action.payload;
    },
    setSelectedProductKey: (state, action: PayloadAction<string>) => {
      state.selectedProductKey = action.payload;
      state.selectedArticle = null;
    },
    setSelectedArticle: (state, action: PayloadAction<string[] | null>) => {
      state.selectedArticle = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setGuidelineUrl: (state, action: PayloadAction<string | null>) => {
      state.guidelineUrl = action.payload;
    },
    resetReview: () => initialState,
  },
});

export const {
  setReviewData,
  setSelectedProductKey,
  setSelectedArticle,
  setLoading,
  setError,
  setGuidelineUrl,
  resetReview
} = reviewSlice.actions;

export default reviewSlice.reducer;