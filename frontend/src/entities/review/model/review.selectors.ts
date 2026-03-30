import { createSelector } from '@reduxjs/toolkit';
import { RootStateLike } from './review.slice';
import { ProcessedProduct } from './types';
import { mapLoanProductToViewModel } from '../lib/review.mapper';

export const selectReviewData = (state: RootStateLike) => state.review.data;
export const selectReviewLoading = (state: RootStateLike) => state.review.loading;
export const selectReviewError = (state: RootStateLike) => state.review.error;
export const selectSelectedProductKey = (state: RootStateLike) => state.review.selectedProductKey;
export const selectSelectedArticle = (state: RootStateLike) => state.review.selectedArticle;
export const selectGuidelineUrl = (state: RootStateLike) => state.review.guidelineUrl;

export const selectProcessedProducts = createSelector(
  [selectReviewData],
  (data): ProcessedProduct[] => {
    if (!data || !data.result || !data.result.products) return [];

    const products: ProcessedProduct[] = data.result.products.map(
      (productData) => mapLoanProductToViewModel(productData.productCode, productData)
    );

    products.sort((a, b) => {
      if (a.isApproved && !b.isApproved) return -1;
      if (!a.isApproved && b.isApproved) return 1;
      return b.calculatedLimit - a.calculatedLimit;
    });

    return products;
  }
);

export const selectCurrentProduct = createSelector(
  [selectProcessedProducts, selectSelectedProductKey],
  (products, selectedKey) => products.find(p => p.productKey === selectedKey) || products[0] || null
);