import { useQuery } from '@tanstack/react-query';
import { VerificationServerResponse } from '@/entities/verification/model/types';
import { MOCK_VERIFICATION_RESPONSE } from './verification.mock';

/**
 * @feature verification/api/useVerificationQuery
 * 서버로부터 서류 검증 결과 원본 데이터를 조회합니다.
 * (Why: API 로직과 데이터를 분리하여 유지보수성 향상 및 백엔드 연동 대비)
 */
export const useVerificationQuery = (id: string) => {
  return useQuery({
    queryKey: ['verification', id],
    queryFn: async (): Promise<VerificationServerResponse> => {
      // (Why: 실제 네트워크 지연 시뮬레이션으로 UX 테스트)
      await new Promise(resolve => setTimeout(resolve, 800));

      // 실제 환경에서는 여기서 apiClient.get(`/verification/${id}`)를 호출합니다.
      return MOCK_VERIFICATION_RESPONSE;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
