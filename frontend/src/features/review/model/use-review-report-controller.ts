import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchReviewResult, fetchGuideline } from '@/entities/review/api/review.api';
import { 
  setReviewData, 
  setLoading, 
  setError, 
  setGuidelineUrl 
} from '@/entities/review/model/review.slice';
import { 
  selectReviewData, 
  selectReviewLoading, 
  selectReviewError, 
  selectGuidelineUrl 
} from '@/entities/review/model/review.selectors';

/**
 * @feature review
 * 리뷰 리포트 페이지의 비즈니스 로직(데이터 패칭, Redux 연동, PDF 상태 관리)을 캡슐화한 컨트롤러 훅
 * (Why) TanStack Query 대신 Redux를 단일 저장소로 사용하여 잦은 리패치(Window Focus 등)를 방지하고 데이터 일관성을 확보합니다.
 */
export const useReviewReportController = (consultationId: string) => {
  const dispatch = useAppDispatch();
  
  // Redux 상태 구독
  const reviewData = useAppSelector(selectReviewData);
  const isLoading = useAppSelector(selectReviewLoading);
  const reviewError = useAppSelector(selectReviewError);
  const guidelineUrl = useAppSelector(selectGuidelineUrl);

  // PDF 뷰어 로컬 상태
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.2);

  /**
   * 서버 데이터 초기 로드 및 동기화
   * (Why) Redux에 데이터가 이미 있다면(SSE로 수신했거나 이전 방문) 중복 요청을 방지합니다.
   */
  useEffect(() => {
    const loadReportData = async () => {
      // 1. 이미 데이터가 있으면 fetch 생략 (중복 요청 방지)
      if (reviewData && guidelineUrl) return;

      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const promises: [Promise<any>, Promise<any>] = [
          !reviewData ? fetchReviewResult(consultationId) : Promise.resolve(reviewData),
          !guidelineUrl ? fetchGuideline() : Promise.resolve(guidelineUrl)
        ];

        const [reportResponse, guidelineResponse] = await Promise.all(promises);

        if (!reviewData) dispatch(setReviewData(reportResponse));
        if (!guidelineUrl) dispatch(setGuidelineUrl(guidelineResponse));
      } catch (err: any) {
        console.error('[ReviewController] Failed to fetch report data:', err);
        dispatch(setError(err.message || '데이터를 불러오는 데 실패했습니다.'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (consultationId) {
      loadReportData();
    }
  }, [consultationId, reviewData, guidelineUrl, dispatch]);

  return {
    isLoading,
    isError: !!reviewError,
    error: reviewError ? new Error(reviewError) : null,
    pdfPage,
    setPdfPage,
    pdfScale,
    setPdfScale,
    guidelineUrl,
  };
};
