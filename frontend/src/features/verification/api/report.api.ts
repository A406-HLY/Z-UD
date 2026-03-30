import { apiClient } from '@/shared/api/client';
import { ReportRequestPayload } from '@/entities/verification/model/report.types';

export const createReport = async (payload: ReportRequestPayload): Promise<void> => {

  await apiClient.post('/reports', payload);
};