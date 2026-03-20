import { useQuery } from '@tanstack/react-query';
import { VerificationServerResponse } from '@/entities/verification/model/types';

/**
 * @feature verification/api/useVerificationQuery
 * 서버로부터 서류 검증 결과 원본 데이터를 조회합니다.
 * (Why: FSD 규칙에 따라 데이터 조회 로직을 Feature 레이어에 격리)
 */
export const useVerificationQuery = (id: string) => {
  return useQuery({
    queryKey: ['verification', id],
    queryFn: async (): Promise<VerificationServerResponse> => {
      // Mock 네트워크 지연
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        data: {
          documents: [
            { 
              id: 'item-1', 
              name: 'HONG_GILDONG_ID.JPG', 
              documentType: 'ID_CARD',
              uploadTime: '2024-03-20 14:30',
              pageCount: 1,
              size: '1.2MB',
              fields: [
                { id: 'f1', key: '성명', value: '홍길동', confidence: 0.99, isMatch: true, isModified: false },
                { id: 'f2', key: '생년월일', value: '1990-01-01', confidence: 0.95, isMatch: true, isModified: false },
                { id: 'f3', key: '주소', value: '서울특별시 강남구...', confidence: 0.92, isMatch: true, isModified: false },
              ]
            },
            { 
              id: 'item-2', 
              name: 'RESIDENT_REGISTER.PDF', 
              documentType: 'RESIDENT_REGISTER',
              uploadTime: '2024-03-20 15:15',
              pageCount: 1,
              size: '2.5MB',
              fields: [
                { id: 'f4', key: '성명', value: '홍길순', confidence: 0.98, isMatch: false, isModified: false }, // 위반 필드 (홍길동과 다름)
                { id: 'f5', key: '생년월일', value: '1990-01-01', confidence: 0.94, isMatch: true, isModified: false },
              ]
            },
            { 
              id: 'item-4', 
              name: 'RISKY_DOC.PDF', 
              documentType: 'MOVE_IN_HOUSEHOLD_REPORT',
              uploadTime: '2024-03-20 16:30',
              pageCount: 1,
              size: '1.5MB',
              fields: [
                { id: 'f6', key: '출력일자', value: '2024-01-01', confidence: 0.75, isMatch: true, isModified: false },
              ]
            }
          ],
          validationResult: {
            documentMissings: [
              { documentType: 'WITHHOLDING_TAX_CERTIFICATE', documentTypeLabel: '근로소득 원천징수영수증' }
            ],
            violations: [
              { documentType: 'RESIDENT_REGISTER', documentTypeLabel: '주민등록등본', fields: ['성명'] }
            ],
            risks: [
              { documentType: 'MOVE_IN_HOUSEHOLD_REPORT', documentTypeLabel: '전입세대열람내역서', fields: ['출력일자'] }
            ]
          }
        }
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
