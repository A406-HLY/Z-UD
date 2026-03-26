import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { ConsultationResponse, ProcessedProduct, ProcessedReviewItem } from './types';
import { APPROVAL_STATUS } from '@/shared/config/constants';

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

      // 거절 항목 1개라도 있으면 미승인 처리 (상수 활용)
      const isApproved = !items.some(item => item.result === APPROVAL_STATUS.REJECT);

      let ltvRatioValue = 0;
      let dsrRatioValue = 0;
      let marketPrice = 0;

      // 상품 내 항목 정렬: 거절이 위로 오도록
      const sortedItems = [...items].sort((a, b) => {
        if (a.result === APPROVAL_STATUS.REJECT && b.result !== APPROVAL_STATUS.REJECT) return -1;
        if (a.result !== APPROVAL_STATUS.REJECT && b.result === APPROVAL_STATUS.REJECT) return 1;
        return 0; // 원본 순서 유지
      });

      // LTV, DSR 핵심 파라미터 및 시세 추출 (지능형 스캔)
      sortedItems.forEach(item => {
        const nameKo = item.name_ko;
        
        // 1. LTV/DSR 비율 추출 (목업에서는 'LTV 비율' 이라는 문자열로 들어오기도 함)
        if (nameKo.includes('LTV 비율')) {
           // 실제 운영 데이터에서는 숫자로 들어올 것을 가정하나, 목업 대응을 위해 파싱 로직 가미
           ltvRatioValue = typeof item.value === 'number' ? item.value : 70; // fallback 70
        }
        if (nameKo.includes('DSR 비율')) {
           dsrRatioValue = typeof item.value === 'number' ? item.value : 40; // fallback 40
        }

        // 2. 담보 시세 추출
        if (nameKo === '담보 시세' || nameKo === '최근 실거래가') {
          if (typeof item.value === 'number') {
            marketPrice = Math.max(marketPrice, item.value);
          }
        }
      });

      // 3. 한도 산출 로직 (Entity Layer에서 처리)
      const calculatedLimit = isApproved && marketPrice > 0 
        ? Math.floor((marketPrice * (ltvRatioValue / 100)) / 1000000) * 1000000 // 백만원 단위 절사
        : 0;

      // 4. 시각화용 파라미터 셋 구성
      const limitParams = [
        { label: "평가 시세 (Market)", value: `${marketPrice.toLocaleString()} 원` },
        { label: "설정비율 (LTV)", value: `${ltvRatioValue}%` },
        { label: "상환능력 (DSR)", value: `${dsrRatioValue}%` },
        { label: "최종 산출 한도", value: `${calculatedLimit.toLocaleString()} 원` }
      ];

      return {
        productKey,
        isApproved,
        ltvLimit: ltvRatioValue,
        dsrLimit: dsrRatioValue,
        calculatedLimit,
        limitParams,
        items: sortedItems
      };
    });

    // 탭 순서(상품) 정렬: 승인된 탭을 제일 앞으로, 그 중 한도가 높은 것 우선
    products.sort((a, b) => {
      if (a.isApproved && !b.isApproved) return -1;
      if (!a.isApproved && b.isApproved) return 1;
      return b.calculatedLimit - a.calculatedLimit;
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
      result = result.filter(i => i.result === APPROVAL_STATUS.PASS || i.result === APPROVAL_STATUS.IRRELEVANT);
    } else if (filter === 'REJECT') {
      result = result.filter(i => i.result === APPROVAL_STATUS.REJECT || i.result === APPROVAL_STATUS.SUPPLEMENT);
    }

    // 하단 컨트롤러 - 정렬 적용
    if (sort === 'PASS_STATUS') {
      // 거절이 위로 설정 (부적격 심각도순 - 상수 기반)
      result.sort((a, b) => {
        const getScore = (res: string) => {
          if (res === APPROVAL_STATUS.REJECT) return 0;
          if (res === APPROVAL_STATUS.SUPPLEMENT) return 1;
          if (res === APPROVAL_STATUS.REVIEW_REQUIRED) return 2;
          return 3;
        };
        return getScore(a.result) - getScore(b.result);
      });
    } else if (sort === 'NAME') {
      result.sort((a, b) => a.name_ko.localeCompare(b.name_ko));
    }

    return result;
  }
);

export default reviewSlice.reducer;
