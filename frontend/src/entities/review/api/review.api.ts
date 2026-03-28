import { ConsultationResponse } from '../model/types';
import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/entities/user';

/**
 * @feature review/api/fetchReviewResult
 * 서버로부터 최종 심사 레포트 데이터를 상세 조회합니다.
 * (Why) SSE REPORT_COMPLETED 이벤트 수신 혹은 직접 페이지 진입 시 레포트를 가져오기 위해 호출합니다.
 */
export const fetchReviewResult = async (consultationId: string): Promise<ConsultationResponse> => {
  const response = await apiClient.get<ApiResponse<ConsultationResponse>>(
    `/reports/${consultationId}`
  );
  return response.data.data;
};

/**
 * @feature review/api/fetchGuideline
 * 내규 가이드라인 PDF 주소를 (Presigned URL) 조회합니다.
 * (Why) 클레임/한도 심사 보고서 우측에서 레퍼런스로 활용됩니다.
 */
export const fetchGuideline = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<string>>('/documents/rules/presigned-url?directory=rules');
  return response.data.data;
};
/**
 * @feature review/api/fetchGuideline
 * 내규 가이드라인 PDF 주소를 (Presigned URL) 조회합니다.
 * (Why) 클레임/한도 심사 보고서 우측에서 레퍼런스로 활용됩니다.
 */
export const fetchGuideline = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<string>>('/documents/rules/presigned-url?directory=rules');
  return response.data.data;
};
