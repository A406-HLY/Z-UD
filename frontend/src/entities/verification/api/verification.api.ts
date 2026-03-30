import { apiClient } from '@/shared/api/client';
import { VerificationServerResponse } from '@/entities/verification/model/types';
import { ApiResponse } from '@/entities/user';

export const fetchVerificationResult = async (consultationId: string): Promise<VerificationServerResponse> => {

  const response = await apiClient.get<ApiResponse<VerificationServerResponse>>(
    `/documents/extraction-results/${consultationId}`
  );

  return response.data.data;
};