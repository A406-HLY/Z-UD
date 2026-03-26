import { useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { validateEssentialDocs } from '@/entities/verification/lib/doc-validator';

/**
 * [WHY: 서버 데이터와 클라이언트 전역 상태를 결합하여 현재 검증 프로세스의 상태를 도출합니다.]
 * 1. TanStack Query를 통해 실시간 서버 데이터(누락 서류 등)를 가져옵니다.
 * 2. Redux에서 사용자 직업 정보(employmentType)를 가져옵니다.
 * 3. 엔티티 레이어의 순수 로직을 호출하여 서비스 차단(Dead-end) 여부 및 필수 누락 목록을 계산합니다.
 */
export const useVerificationStatus = () => {
  // 1. 상담 ID 조회 (URL 파라미터 우선, 없으면 Redux에서 가져옴)
  useParams<{ consultationId: string }>();

  // 2. 서버 데이터 조회 (Redux Audit 슬라이스)
  const ocrData = useAppSelector(state => state.audit.data.ocrData);
  const ocrStatus = useAppSelector(state => state.audit.steps.ocr);
  
  const isLoading = ocrStatus === 'LOADING' || ocrStatus === 'IDLE';
  const isError = ocrStatus === 'ERROR';

  // 3. 사용자 직업 정보 조회 (Redux)
  const employmentType = useAppSelector((state) => state.customer.data.employmentType);

  // 3. 필수 서류 누락 검증 (Derived State)
  const validationResult = ocrData?.data?.validationResult;
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
    originalData: ocrData?.data,
  };
};
