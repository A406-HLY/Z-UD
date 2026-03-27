import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { useGetReview } from '@/entities/review/api/review.api';
import { setReviewData, setSelectedProductKey } from '@/entities/review/model/review.slice';
import { selectProcessedProducts, selectSelectedArticle, selectSelectedProductKey } from '@/entities/review/model/review.selectors';
import { ARTICLE_PAGE_MAP } from '@/shared/config/pdfConfig';

/**
 * @feature review
 * 리뷰 리포트 페이지의 비즈니스 로직(데이터 패칭, 동기화, PDF 상태 관리)을 캡슐화한 컨트롤러 훅
 */
export const useReviewReportController = (consultationId: string) => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProcessedProducts);
  const selectedProductKey = useAppSelector(selectSelectedProductKey);
  const selectedArticle = useAppSelector(selectSelectedArticle);

  // PDF 뷰어 연동 상태
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.2);

  // 1. 서버 데이터 페칭 (TanStack Query)
  const { data, isLoading, isError, error } = useGetReview(consultationId);

  // 2. 서버 상태 -> 전역 클라이언트 상태(Redux) 동기화
  useEffect(() => {
    if (data) {
      dispatch(setReviewData(data));
    }
  }, [data, dispatch]);

  // 3. 상품 자동 선택 로직 (정렬된 순서상 첫 번째 상품 우선)
  useEffect(() => {
    if (products.length > 0 && !selectedProductKey) {
      dispatch(setSelectedProductKey(products[0].productKey));
    }
  }, [products, selectedProductKey, dispatch]);

  // 4. 조항 클릭 시 PDF 스크롤(페이지 이동) 싱크
  useEffect(() => {
    if (selectedArticle && selectedArticle.length > 0) {
      const targetRule = selectedArticle[0];
      const targetPage = ARTICLE_PAGE_MAP[targetRule];
      if (targetPage) {
        setPdfPage(targetPage);
      }
    }
  }, [selectedArticle]);

  return {
    isLoading,
    isError,
    error,
    pdfPage,
    setPdfPage,
    pdfScale,
    setPdfScale,
  };
};
