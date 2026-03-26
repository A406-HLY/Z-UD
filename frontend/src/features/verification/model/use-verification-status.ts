import { useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { useVerificationQuery } from '@/features/verification/api/use-verification-query';
import { validateEssentialDocs } from '@/entities/verification/lib/doc-validator';

/**
 * [WHY: 서버 데이터와 클라이언트 전역 상태를 결합하여 현재 검증 프로세스의 상태를 도출합니다.]
 * 1. TanStack Query를 통해 실시간 서버 데이터(누락 서류 등)를 가져옵니다.
 * 2. Redux에서 사용자 직업 정보(employmentType)를 가져옵니다.
 * 3. 엔티티 레이어의 순수 로직을 호출하여 서비스 차단(Dead-end) 여부 및 필수 누락 목록을 계산합니다.
 */
export const useVerificationStatus = () => {
  const { id } = useParams<{ id: string }>();
  
  // 1. 서버 데이터 조회 (TanStack Query)
  const { data, isLoading, isError } = useVerificationQuery(id || '');

  // 2. 사용자 직업 정보 조회 (Redux)
  // (Note: customer 슬라이스의 data.employmentType 필드를 참조합니다.)
  const employmentType = useAppSelector((state) => state.customer.data.employmentType);

  // 3. 필수 서류 누락 검증 (Derived State)
  const validationResult = data?.data?.validationResult;
  const { isBlocked, essentialMissings, otherMissings } = validateEssentialDocs(
    validationResult?.documentMissings || [],
    employmentType
  );

  return {
    /** 데이터 로딩 처리 중 여부 */
    isLoading,
    /** 조회 실패 여부 */
    isError,
    /** 서비스 진행 가능 여부 (true일 경우 팝업 노출 및 하단 버튼 비활성화) */
    isBlocked,
    /** UI에서 보여줄 필수 누락 서류 목록 */
    essentialMissings,
    /** 기타(선택적) 누락 서류 목록 */
    otherMissings,
    /** 원본 데이터 전체 (전송 시 병합용) */
    originalData: data?.data,
  };
};
