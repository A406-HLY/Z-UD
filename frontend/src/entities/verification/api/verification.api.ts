import { VerificationServerResponse } from '@/entities/verification/model/types';
import { MOCK_VERIFICATION_RESPONSE } from '@/features/verification/api/verification.mock';

/**
 * @feature verification/api/fetchVerificationResult
 * 서버로부터 서류 검증 결과 원본 데이터를 조회합니다.
 * (Note: 테스트를 위해 임시로 MOCK_VERIFICATION_RESPONSE를 반환합니다.)
 */
export const fetchVerificationResult = async (consultationId: string): Promise<VerificationServerResponse> => {
  // 실제 연동 시: 
  // const response = await apiClient.get<VerificationServerResponse>(`/documents/extraction-results/${consultationId}`);
  // return response.data;
  consultationId; // 빌드테스트 레거시

  // (Why) 실제 네트워크 지연 시간을 시뮬레이션합니다.
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_VERIFICATION_RESPONSE;
};
