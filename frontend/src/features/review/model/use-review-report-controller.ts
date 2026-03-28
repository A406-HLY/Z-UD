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

  // 1. 심사 완료 상태 및 기존 데이터 구독
  const { isAllAuditDone } = useAppSelector((state) => state.audit);
  const reviewData = useAppSelector((state) => state.review.data);

  // 2. 서버 데이터 페칭 (TanStack Query)
  // (Why) 이미 SSE를 통해 데이터를 가져왔다면 캐시된 데이터를 사용합니다.
  const { data, isLoading: isQueryLoading, isError, error } = useGetReview(consultationId);

  // 3. 서버 상태 -> 전역 클라이언트 상태(Redux) 동기화
  useEffect(() => {
    if (data && !reviewData) {
      dispatch(setReviewData(data));
    }
  }, [data, reviewData, dispatch]);

  // 4. 상품 자동 선택 로직 (정렬된 순서상 첫 번째 상품 우선)
  useEffect(() => {
    if (products.length > 0 && !selectedProductKey) {
      dispatch(setSelectedProductKey(products[0].productKey));
    }
  }, [products, selectedProductKey, dispatch]);

  // 5. 조항 클릭 시 PDF 스크롤(페이지 이동) 싱크
  useEffect(() => {
    if (selectedArticle && selectedArticle.length > 0) {
      const targetRule = selectedArticle[0];
      const targetPage = ARTICLE_PAGE_MAP[targetRule];
      if (targetPage) {
        setPdfPage(targetPage);
      }
    }
  }, [selectedArticle]);

  // (Why) 사용자 요청에 따라, 심사가 완료되고 데이터가 존재할 때만 로딩이 완료된 것으로 간주합니다.
  const finalLoading = !isAllAuditDone || isQueryLoading || !reviewData;

  return {
    isLoading: finalLoading,
    isError,
    error,
    pdfPage,
    setPdfPage,
    pdfScale,
    setPdfScale,
  };
};
