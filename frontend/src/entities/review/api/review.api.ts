import { ConsultationResponse } from '../model/types';
import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/entities/user';

export const fetchReviewResult = async (consultationId: string): Promise<ConsultationResponse> => {
  const response = await apiClient.get<ApiResponse<ConsultationResponse>>(
    `/reports/${consultationId}`
  );
  return response.data.data;
};

export const fetchGuideline = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<string>>('/documents/rules/presigned-url?directory=rules');
  return response.data.data;
};