import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { updateField, resetVerification, setActiveDocument } from '@/entities/verification/model/slice';
import { setIsPollingActive } from '@/entities/customer/model/slice';

/**
 * [WHY: 검증 프로세스에서 발생하는 사용자 액션(수합, 이동, 종료)을 관리하는 비즈니스 로직 훅입니다.]
 * 1. Redux 전역 상태 수정 액션을 래핑하여 컴포넌트 사용성을 높입니다.
 * 2. 서비스 종료 시 전역 상태 초기화 및 페이지 이동 로직을 집중 관리합니다.
 * 3. FSD 원칙에 따라 엔티티 액션을 기능 단위(Feature)로 묶어 제공합니다.
 */
export const useVerificationActions = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /** 
   * 특정 문서의 필드 수정 
   * @param docId - 문서 고유 ID
   * @param path - Dot-notation 경로 (예: "userInfo.name")
   * @param value - 새로운 값
   */
  const onFieldUpdate = (docId: string, path: string, value: unknown) => {
    dispatch(updateField({ docId, path, value }));
  };

  /** 
   * 화면에 표시할 활성 문서 선택 
   */
  const onSelectDocument = (docId: string) => {
    dispatch(setActiveDocument(docId));
  };

  /**
   * 서비스 강제 종료 (Dead-end 상황)
   * (Why: 필수 서류 누락 팝업 등에서 호출되며, 상태 초기화 후 초기 화면으로 이동합니다.)
   */
  const handleEndService = () => {
    // 1. 진행 중이던 수정 데이터 및 서류 폴링 상태 초기화
    dispatch(resetVerification());
    dispatch(setIsPollingActive(false));
    
    // (Why) 폴링을 중단하더라도 React Query가 캐싱하고 있던 이전 서류 리스트가 브라우저 화면에 
    // 남아 스캔 완료된 것처럼 보이는 현상을 방지하기 위해 캐시를 날립니다.
    queryClient.removeQueries({ queryKey: ['agent-files'] });

    // 2. 프로세스 첫 단계(대출 신청 정보 입력)로 이동하여 재시작 유도
    // (Note: 세션을 유지하며 처음부터 다시 정보를 입력할 수 있도록 /basic-info로 이동합니다.)
    navigate('/basic-info');
  };

  /**
   * 다음 단계로 진행 (대출 신청 정보 입력 페이지)
   * (Note: routes.tsx 기준 /basic-info 경로로 이동합니다.)
   */
  const handleNextStep = () => {
    navigate('/customer-info'); 
  };

  return {
    onFieldUpdate,
    onSelectDocument,
    handleEndService,
    handleNextStep,
  };
};
