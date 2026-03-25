import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { env } from '@/shared/config/env';
import { 
  setSseConnected, 
  setAllAuditDone, 
  setCurrentMessage, 
  updateStepStatus,
  setHouseAuditData,
  setCreditData,
  setLoanData,
  addErrorMessage
} from '../model/audit.slice';

/**
 * @feature Audit/SSE
 * 백엔드 SSE(Server-Sent Events) 스트림에 연결하여 실시간 심사진행 상태와 데이터를 Redux에 업데이트하는 훅입니다.
 */
export const useSseAudit = (counselId: string | undefined, isTriggered: boolean) => {
  const dispatch = useAppDispatch();
  const { isSseConnected } = useAppSelector((state) => state.audit);

  const connectSse = useCallback(() => {
    if (!counselId || !isTriggered) return;

    // (Why) 현재 프론트엔드 환경에 맞게 네이티브 EventSource와 withCredentials 세션 쿠키 인증을 사용합니다.
    const url = `${env.apiBaseUrl}/notification/subscribe?consultationId=${counselId}`;
    const eventSource = new EventSource(url, { withCredentials: true });

    // 0. 연결 시작 (onopen)
    eventSource.onopen = () => {
      console.log('[SSE] Connection opened (onopen)');
      dispatch(setSseConnected(true));
      dispatch(setCurrentMessage('서버와 실시간 연결됨...'));
    };

    // 1. 초기 연결 수신 (Event: connect)
    eventSource.addEventListener('connect', (event: MessageEvent) => {
      console.log('[SSE] "connect" event received:', event.data);
      dispatch(setSseConnected(true));
      dispatch(setCurrentMessage('심사 프로세스를 시작합니다...'));
    });

    // 보조 메시지 수신 (이름 없는 이벤트)
    eventSource.onmessage = (event) => {
      console.log('[SSE] Standard message received:', event.data);
    };

    // 2. OCR 이벤트
    eventSource.addEventListener('OCR_COMPLETED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(updateStepStatus({ step: 'ocr', status: 'SUCCESS', message: payload.message || 'OCR 분석 완료' }));
    });
    eventSource.addEventListener('OCR_FAILED', () => {
      dispatch(updateStepStatus({ step: 'ocr', status: 'ERROR', message: 'OCR 분석 실패' }));
      dispatch(addErrorMessage('OCR 처리에 실패했습니다.'));
    });

    // 3. 주택 심사 이벤트 (House Audit)
    eventSource.addEventListener('HOUSE_AUDIT_STARTED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(updateStepStatus({ step: 'houseAudit', status: 'LOADING', message: `주택 심사 시작: ${payload.data?.propertyAddress || ''}` }));
    });
    eventSource.addEventListener('HOUSE_AUDIT_COMPLETED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(setHouseAuditData(payload.data));
      dispatch(updateStepStatus({ step: 'houseAudit', status: 'SUCCESS', message: payload.message || '주택 심사 완료' }));
      checkAllDone();
    });
    eventSource.addEventListener('HOUSE_AUDIT_PRICE_CHECK_COMPLETED', () => {
      dispatch(setCurrentMessage('주택 시세 조회 완료'));
    });
    eventSource.addEventListener('HOUSE_AUDIT_NEAREST_BRANCH_CHECK_COMPLETED', () => {
      dispatch(setCurrentMessage('가까운 관할 지점 매칭 완료'));
    });
    eventSource.addEventListener('HOUSE_AUDIT_FAILED', () => {
      dispatch(updateStepStatus({ step: 'houseAudit', status: 'ERROR', message: '주택 심사 실패' }));
      dispatch(addErrorMessage('주택 심사 중 오류가 발생했습니다.'));
    });

    // 4. 마이데이터/신용(Credit/Loan) 이벤트
    eventSource.addEventListener('MY_DATA_AUDIT_STARTED', () => {
      dispatch(setCurrentMessage('마이데이터 스크래핑 시작...'));
    });
    eventSource.addEventListener('MY_DATA_CREDIT_RATING_LOOKUP_STARTED', () => {
      dispatch(updateStepStatus({ step: 'credit', status: 'LOADING', message: '신용등급 조회 중...' }));
    });
    eventSource.addEventListener('MY_DATA_CREDIT_RATING_LOOKUP_COMPLETED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(setCreditData(payload.data));
      dispatch(updateStepStatus({ step: 'credit', status: 'SUCCESS', message: payload.message || '신용등급 조회 완료' }));
    });
    eventSource.addEventListener('MY_DATA_LOAN_PRODUCTS_LOOKUP_STARTED', () => {
      dispatch(updateStepStatus({ step: 'loanHistory', status: 'LOADING', message: '기존 대출 내역 조회 중...' }));
    });
    eventSource.addEventListener('MY_DATA_LOAN_PRODUCTS_LOOKUP_COMPLETED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(setLoanData(payload.data));
      dispatch(updateStepStatus({ step: 'loanHistory', status: 'SUCCESS', message: payload.message || '대출 내역 조회 완료' }));
      checkAllDone();
    });
    
    // 최종 레포트 완료
    eventSource.addEventListener('REPORT_COMPLETED', () => {
      dispatch(setAllAuditDone(true));
      dispatch(setCurrentMessage('모든 심사가 완료되었습니다. 결과를 확인하세요.'));
      eventSource.close();
      dispatch(setSseConnected(false));
    });

    // 서버 기본 에러 처리
    eventSource.onerror = (error) => {
      console.error('[SSE] Connection Error:', error);
      dispatch(setSseConnected(false));
      eventSource.close();
    };

    return () => {
      eventSource.close();
      dispatch(setSseConnected(false));
    };
  }, [counselId, isTriggered, dispatch]);

  // (Why) 주요 심사(신용, 대출내역, 주택)가 모두 끝났는지 내부적으로 평가하는 헬퍼 함수
  const checkAllDone = () => {
    // Note: 실제 운영에서는 REPORT_COMPLETED 이벤트가 트리거되므로 이 프론트엔드 체크 로직은 보조적인 수단입니다.
  };

  useEffect(() => {
    const cleanup = connectSse();
    return cleanup;
  }, [connectSse]);

  return { isSseConnected };
};
