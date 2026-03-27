import { apiClient } from '@/shared/api/client';
import { VerificationServerResponse } from '@/entities/verification/model/types';
import { ApiResponse } from '@/entities/user';

/**
 * @feature verification/api/fetchVerificationResult
 * 서버로부터 서류 검증 결과 원본 데이터를 조회합니다.
 * (Why) SSE OCR_COMPLETED 이벤트 수신 후, 실제 추출된 데이터를 가져오기 위해 호출합니다.
 */
export const fetchVerificationResult = async (consultationId: string): Promise<VerificationServerResponse> => {
  // (Why) 백엔드 규격에 맞춰 /documents/extraction 엔드포인트를 호출합니다.
  const response = await apiClient.get<ApiResponse<VerificationServerResponse>>(
    `/documents/extraction-results/${consultationId}`
  );
  
  // (Why) 공통 응답 규격(ApiResponse)에서 실제 도메인 데이터부(VerificationServerResponse)만 추출하여 반환합니다.
  return response.data.data;
};
