import { useMutation } from '@tanstack/react-query';
import { createReport } from './report.api';
import { ReportRequestPayload } from '@/entities/verification/model/report.types';

/**
 * @feature verification/use-create-report
 * 가심사 리포트 생성을 위한 Mutation Hook입니다.
 * (Why) TanStack Query를 사용하여 비동기 요청의 로딩, 성공, 실패 상태를 선언적으로 관리합니다.
 */
export const useCreateReport = () => {
  return useMutation({
    mutationFn: (payload: ReportRequestPayload) => createReport(payload),
    onSuccess: () => {
      // (Why) 차후 토스트 알림 등으로 확장 가능하도록 성공 핸들러를 열어둡니다.
      console.log('✅ 가심사 리포트 생성이 완료되었습니다.');
    },
    onError: (error) => {
      console.error('❌ 리포트 생성 중 오류 발생:', error);
      alert('리포트 생성 중 문제가 발생했습니다. 다시 시도해주세요.');
    },
  });
};
