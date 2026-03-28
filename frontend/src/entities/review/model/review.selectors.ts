import { createSelector } from '@reduxjs/toolkit';
import { RootStateLike } from './review.slice';
import { ProcessedProduct } from './types';
import { mapLoanProductToViewModel } from '../lib/review.mapper';

// === Base Selectors ===
export const selectReviewData = (state: RootStateLike) => state.review.data;
export const selectSelectedProductKey = (state: RootStateLike) => state.review.selectedProductKey;
export const selectSelectedArticle = (state: RootStateLike) => state.review.selectedArticle;

/**
 * 데이터 가공 Selector: 
 * 원본 데이터를 UI에 그리기 좋게 평탄화하고(ProcessedProduct),
 * 상품 탭(승인+대출한도) 정렬을 처리합니다.
 */
export const selectProcessedProducts = createSelector(
  [selectReviewData],
  (data): ProcessedProduct[] => {
    if (!data || !data.result || !data.result.products) return [];

    // 1. 순수 매퍼 함수를 통해 응답 모델을 뷰 모델로 매핑
    // (Key point) V2 규격은 result.products 배열 형태이므로 Object.entries 대신 배열 map을 사용합니다.
    const products: ProcessedProduct[] = data.result.products.map(
      (productData) => mapLoanProductToViewModel(productData.productCode, productData)
    );

    // 2. 탭 순서(상품) 정렬: 승인된 탭을 제일 앞으로, 그 중 한도가 높은 것 우선
    products.sort((a, b) => {
      if (a.isApproved && !b.isApproved) return -1;
      if (!a.isApproved && b.isApproved) return 1;
      return b.calculatedLimit - a.calculatedLimit;
    });

    return products;
  }
);

/**
 * 현재 활성화된 탭(상품)의 데이터를 반환하는 Selector
 */
export const selectCurrentProduct = createSelector(
  [selectProcessedProducts, selectSelectedProductKey],
  (products, selectedKey) => products.find(p => p.productKey === selectedKey) || products[0] || null
);
