import { useQuery } from '@tanstack/react-query';
import { ConsultationResponse } from '../model/types';
import { dummyConsultationData } from './mock';

/**
 * @entity review
 * 대출 심사 리포트 데이터를 가져오는 API Hook
 * 
 * (Why) 현재는 백엔드 구현 전이므로 Mock 데이터를 비동기로 반환합니다.
 * 실제 API 연합 시 이 훅 내부의 fetch 로직만 axios 호출로 변경하면 됩니다.
 */
export const useGetReview = (consultationId: string) => {
  return useQuery<ConsultationResponse>({
    queryKey: ['review', consultationId],
    queryFn: async () => {
      // API 지연 시뮬레이션 (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // (Why) 실제 운영 시에는 여기서 apiClient.get(`/api/reviews/${consultationId}`) 를 호출합니다.
      return dummyConsultationData as ConsultationResponse;
    },
    enabled: !!consultationId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};
