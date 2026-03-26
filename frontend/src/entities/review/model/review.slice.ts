import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { ConsultationResponse, ProcessedProduct, ProcessedReviewItem } from './types';

// RootStateLike: store 의존성 사이클 방지를 위한 로컬 타입
interface RootStateLike {
  review: ReviewState;
}

export type FilterType = 'ALL' | 'PASS' | 'REJECT';
export type SortType = 'PASS_STATUS' | 'NAME';

export interface ReviewState {
  data: ConsultationResponse | null;
  selectedProductKey: string | null;
  listFilter: FilterType;       // 하단 리스트 필터 상태
  listSort: SortType;           // 하단 리스트 정렬 상태
  selectedArticle: string[] | null; // PDF 뷰어 연동용 조항 데이터 (문자열 배열)
}

const initialState: ReviewState = {
  data: null,
  selectedProductKey: null,
  listFilter: 'ALL',
  listSort: 'PASS_STATUS',
  selectedArticle: null,
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    // API 데이터 세팅 및 기본 탭 설정
    setReviewData: (state, action: PayloadAction<ConsultationResponse>) => {
      state.data = action.payload;
      if (action.payload?.result) {
        const keys = Object.keys(action.payload.result);
        if (keys.length > 0 && !state.selectedProductKey) {
          state.selectedProductKey = keys[0];
        }
      }
    },
    // 선택된 상품 탭 변경
    setSelectedProductKey: (state, action: PayloadAction<string>) => {
      state.selectedProductKey = action.payload;
      state.selectedArticle = null; // 탭 전환 시 조항 클리어
    },
    // 하단 상세 리스트 필터 변경
    setListFilter: (state, action: PayloadAction<FilterType>) => {
      state.listFilter = action.payload;
    },
    // 하단 상세 리스트 정렬 변경
    setListSort: (state, action: PayloadAction<SortType>) => {
      state.listSort = action.payload;
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
  setListFilter, 
  setListSort, 
  setSelectedArticle, 
  resetReview 
} = reviewSlice.actions;

// === Selectors ===

export const selectReviewData = (state: RootStateLike) => state.review.data;
export const selectSelectedProductKey = (state: RootStateLike) => state.review.selectedProductKey;
export const selectListFilter = (state: RootStateLike) => state.review.listFilter;
export const selectListSort = (state: RootStateLike) => state.review.listSort;
export const selectSelectedArticle = (state: RootStateLike) => state.review.selectedArticle;

/**
 * 1. 데이터 가공 Selector: 
 * 원본 데이터를 UI에 그리기 좋게 평탄화하고(ProcessedProduct),
 * 상품 내 거절 항목 상위 노출, 상품 탭(승인+대출한도) 정렬을 한 번에 처리합니다.
 */
export const selectProcessedProducts = createSelector(
  [selectReviewData],
  (data): ProcessedProduct[] => {
    if (!data || !data.result) return [];

    const products: ProcessedProduct[] = Object.entries(data.result).map(([productKey, productData]) => {
      const items: ProcessedReviewItem[] = Object.entries(productData).map(([key, item]) => ({
        ...item,
        key
      }));

      // 거절 항목 1개라도 있으면 미승인 처리
      const isApproved = !items.some(item => item.result === '거절');

      let ltvLimit = 0;
      let dsrLimit = 0;

      // 상품 내 항목 정렬: 거절이 위로 오도록
      const sortedItems = [...items].sort((a, b) => {
        if (a.result === '거절' && b.result !== '거절') return -1;
        if (a.result !== '거절' && b.result === '거절') return 1;
        return 0; // 원본 순서 유지
      });

      // LTV, DSR 핵심 파라미터 파싱
      sortedItems.forEach(item => {
        const nameUpper = item.name_ko.toUpperCase();
        if (nameUpper.includes('LTV') && typeof item.value === 'number') {
          ltvLimit = Math.max(ltvLimit, item.value);
        }
        if (nameUpper.includes('DSR') && typeof item.value === 'number') {
          dsrLimit = Math.max(dsrLimit, item.value);
        }
      });

      return {
        productKey,
        isApproved,
        ltvLimit,
        dsrLimit,
        items: sortedItems
      };
    });

    // 탭 순서(상품) 정렬: 승인된 탭을 제일 앞으로, 그 중 LTV 한도가 높은 것 우선
    products.sort((a, b) => {
      if (a.isApproved && !b.isApproved) return -1;
      if (!a.isApproved && b.isApproved) return 1;
      if (b.ltvLimit !== a.ltvLimit) return b.ltvLimit - a.ltvLimit;
      return b.dsrLimit - a.dsrLimit;
    });

    return products;
  }
);

/**
 * 2. 현재 선택된 탭 정보 반환
 */
export const selectCurrentProduct = createSelector(
  [selectProcessedProducts, selectSelectedProductKey],
  (products, selectedKey) => products.find(p => p.productKey === selectedKey) || products[0] || null
);

/**
 * 3. 하단 상세 리스트 정렬/필터 적용 Selector
 */
export const selectFilteredAndSortedCurrentItems = createSelector(
  [selectCurrentProduct, selectListFilter, selectListSort],
  (currentProduct, filter, sort): ProcessedReviewItem[] => {
    if (!currentProduct) return [];

    let result = [...currentProduct.items];

    // 하단 컨트롤러 - 필터 적용
    if (filter === 'PASS') {
      result = result.filter(i => i.result === '승인' || i.result === '상관 없음');
    } else if (filter === 'REJECT') {
      result = result.filter(i => i.result === '거절' || i.result === '자료 보완 요망');
    }

    // 하단 컨트롤러 - 정렬 적용
    if (sort === 'PASS_STATUS') {
      // 거절이 위로 설정 (부적격 심각도순)
      result.sort((a, b) => {
        const getScore = (res: string) => (res === '거절' ? 0 : res === '자료 보완 요망' ? 1 : 2);
        return getScore(a.result) - getScore(b.result);
      });
    } else if (sort === 'NAME') {
      result.sort((a, b) => a.name_ko.localeCompare(b.name_ko));
    }

    return result;
  }
);

export default reviewSlice.reducer;
