import { useMutation } from '@tanstack/react-query';
import { createReport } from './report.api';
import { ReportRequestPayload } from '@/entities/verification/model/report.types';

export const useCreateReport = () => {
  return useMutation({
    mutationFn: (payload: ReportRequestPayload) => createReport(payload),
    onSuccess: () => {

    },
    onError: () => {

      alert('리포트 생성 중 문제가 발생했습니다. 다시 시도해주세요.');
    },
  });
};