import { useQuery } from '@tanstack/react-query';
import { VerificationResult } from '@/entities/verification/model/types';

/**
 * @feature verification/api/useVerificationQuery
 * 서류 검증 결과 데이터를 조회하는 훅입니다. (Why: 데이터의 실시간 상태 확인)
 */
export const useVerificationQuery = (id: string) => {
  return useQuery({
    queryKey: ['verification', id],
    queryFn: async (): Promise<VerificationResult> => {
      // Mock 네트워크 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        id,
        selectedDocId: 'item-1',
        categories: [
          {
            id: 'cat-1',
            name: 'Identity Documents',
            items: [
              { id: 'item-1', name: 'HONG_GILDONG_ID.JPG', status: 'VERIFIED', size: '1.2MB' },
              { id: 'item-2', name: 'PASSPORT_COPY.PDF', status: 'PENDING', size: '2.5MB' },
            ],
          },
          {
            id: 'cat-2',
            name: 'Income Statements',
            items: [
              { id: 'item-3', name: 'TAX_2023_PROOFS.PDF', status: 'ERROR', size: '0.8MB' },
            ],
          },
        ],
        extractedData: {
          DOCUMENT_TYPE: 'RESIDENT_IDENTITY_CARD',
          FULL_NAME: 'HONG GILDONG',
          BIRTH_DATE: '1999-12-09',
          ISSUE_DATE: '2018-05-14',
          ADDRESS: 'GANGNAM-GU, SEOUL, KOREA',
          VERIFICATION_SCORE: '98.5%',
        },
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
