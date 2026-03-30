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

export const useReviewReportController = (consultationId: string) => {
  const dispatch = useAppDispatch();

  const reviewData = useAppSelector(selectReviewData);
  const isLoading = useAppSelector(selectReviewLoading);
  const reviewError = useAppSelector(selectReviewError);
  const guidelineUrl = useAppSelector(selectGuidelineUrl);

  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.2);

  useEffect(() => {
    const loadReportData = async () => {
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