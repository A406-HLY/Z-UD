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
/**
 * @feature review/api/fetchGuideline
 * (Mock) 내규 가이드라인 PDF 주소를 조회합니다.
 * (Why) 실제 백엔드 API가 준비되기 전까지 클라우드플레어 R2 URL을 사용하여 렌더링을 테스트합니다.
 */
export const fetchGuideline = async (): Promise<string> => {
  // (Note) 사용자께서 제공하신 클라우드플레어 R2 URL (7200초 만료 시간 포함)
  const MOCK_GUIDELINE_URL = "https://zud.1545aa8dbd17c953859ba18c2d45a346.r2.cloudflarestorage.com/57a13356-df99-47e1-9258-78e159497ce7/%EA%B7%BC%EB%A1%9C%EC%86%8C%EB%93%9D%EC%9B%90%EC%B2%9C%EC%A7%95%EC%88%98%EC%98%81%EC%88%98%EC%A6%9D%20-%20%EA%B9%80%EB%AF%BC%EC%88%98.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260328T175007Z&X-Amz-SignedHeaders=host&X-Amz-Credential=65658bacb38142144df03254df248161%2F20260328%2Fauto%2Fs3%2Faws4_request&X-Amz-Expires=7200&X-Amz-Signature=45fcd6de02513b58a6b1eb4137cb491ea25ace4bb0b89502af826a3f28951b75";
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_GUIDELINE_URL), 300); // 300ms 지연 후 응답
  });
};

/**
 * @feature review
 * 내규 가이드라인 데이터를 가져오는 TanStack Query Hook
 */
export const useGetGuideline = () => {
  return useQuery<string>({
    queryKey: ['guideline'],
    queryFn: fetchGuideline,
    staleTime: 1000 * 60 * 60, // 내규 문서는 자주 바뀌지 않으므로 1시간 캐시 유지
  });
};
