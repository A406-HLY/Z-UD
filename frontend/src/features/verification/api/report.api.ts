import { apiClient } from '@/shared/api/client';
import { ReportRequestPayload } from '@/entities/verification/model/report.types';

/**
 * @feature verification/api/report
 * 최종 가심사 리포트를 서버로 전송합니다.
 */
export const createReport = async (payload: ReportRequestPayload): Promise<void> => {
  // (Why) 공통 apiClient를 사용하여 인증 및 기본 설정을 상속받습니다.
  // VITE_API_BASE_URL(/api/v1) + /reports = /api/v1/reports
  await apiClient.post('/reports', payload);
};
