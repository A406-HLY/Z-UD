import { useQuery } from '@tanstack/react-query';
import { ConsultationResponse } from '../model/types';
import { apiClient } from '@/shared/api/client';     // (누락됨)
import { ApiResponse } from '@/entities/user';        // (누락됨)


/**
 * @feature review/api/fetchReviewResult
 * 서버로부터 최종 심사 레포트 데이터를 상세 조회합니다.
 * (Why) SSE REPORT_COMPLETED 이벤트 수신 후, 생성된 레포트를 가져오기 위해 호출합니다.
 */
export const fetchReviewResult = async (consultationId: string): Promise<ConsultationResponse> => {
  // (Why) 사용자 요청에 따라 /api/v1/reports/{id} 엔드포인트를 호출합니다.
  const response = await apiClient.get<ApiResponse<ConsultationResponse>>(
    `/reports/${consultationId}`
  );
  return response.data.data;
};

/**
 * @feature review
 * 대출 심사 리포트 데이터를 가져오는 TanStack Query Hook
 * 
 * (Why) 페이지 진입 시점에 데이터를 캐싱하고 관리하기 위해 사용합니다.
 */
export const useGetReview = (consultationId: string | undefined) => {
  return useQuery<ConsultationResponse>({
    queryKey: ['review', consultationId],
    queryFn: () => {
      if (!consultationId) throw new Error('Consultation ID is required');
      return fetchReviewResult(consultationId);
    },
    enabled: !!consultationId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};
