import { useState, useEffect } from 'react';

/**
 * @hook useAuditProgress
 * (Why) 백엔드의 SSE(Server-Sent Events) 프로토콜을 모사하여 심사 단계별 진행 상태를 관리합니다.
 * (P1) 피드백 반영: 실제 운영 환경에서는 EventSource를 통해 실시간 이벤트를 수신하도록 교체 가능합니다.
 */
export const useAuditProgress = (isBackendLoading: boolean) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isAllDone, setIsAllDone] = useState(false);

  useEffect(() => {
    // (Why) 백엔드 데이터(TanStack Query)가 아직 로딩 중이면 진행을 시작하지 않음
    if (isBackendLoading) return;

    // (Why) 사용자 요청에 따라 마이데이터를 제외한 3단계 프로세스 정의
    const stepIds = ['credit-rating', 'loan-history', 'house-audit'];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < stepIds.length) {
        const stepId = stepIds[currentStep];
        setCompletedSteps(prev => new Set(prev).add(stepId));
        currentStep++;
      } else {
        clearInterval(interval);
        // (Why) 모든 정적 시각화가 완료된 후 최종 레포트 준비 상태로 전환
        setTimeout(() => setIsAllDone(true), 300);
      }
    }, 800); // (Why) B2B 시스템의 묵직한 진단 느낌을 위해 0.8초 간격 유지

    return () => clearInterval(interval);
  }, [isBackendLoading]);

  return { completedSteps, isAllDone };
};
