import { useEffect, useCallback, useRef } from 'react';
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
  setOcrData,
  addErrorMessage
} from '../model/audit.slice';
import { setReviewData } from '@/entities/review/model/review.slice';
import { fetchVerificationResult } from '@/entities/verification/api/verification.api';
import { fetchReviewResult } from '@/entities/review/api/review.api';

export const useSseAudit = (consultationId: string | undefined, isTriggered: boolean) => {
  const dispatch = useAppDispatch();
  const { isSseConnected } = useAppSelector((state) => state.audit);
  const accessToken = useAppSelector((state) => state.auth.user?.accessToken);

  const accessTokenRef = useRef(accessToken);
  const consultationIdRef = useRef(consultationId);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => { accessTokenRef.current = accessToken; }, [accessToken]);
  useEffect(() => { consultationIdRef.current = consultationId; }, [consultationId]);

  const handleOcrCompleted = useCallback(async (payload: { message?: string }) => {
    dispatch(updateStepStatus({ step: 'ocr', status: 'LOADING' }));
    try {
      const currentConsultationId = consultationIdRef.current;
      if (!currentConsultationId) return;
      const ocrResult = await fetchVerificationResult(currentConsultationId);
      dispatch(setOcrData(ocrResult));
      dispatch(updateStepStatus({ step: 'ocr', status: 'SUCCESS', message: payload.message || 'OCR 분석 완료' }));
    } catch (error) {

      dispatch(updateStepStatus({ step: 'ocr', status: 'ERROR', message: 'OCR 데이터 수취 실패' }));
      dispatch(addErrorMessage('OCR 데이터를 불러오는 데 실패했습니다.'));
    }
  }, [dispatch]);

  const handleReportCompleted = useCallback(async () => {
    try {
      const currentConsultationId = consultationIdRef.current;
      if (!currentConsultationId) return;

      const reportData = await fetchReviewResult(currentConsultationId);

      dispatch(setReviewData(reportData));

      dispatch(setAllAuditDone(true));
      dispatch(setCurrentMessage('모든 심사가 완료되었습니다. 결과를 확인하세요.'));
    } catch (error) {

      dispatch(addErrorMessage('최종 레포트 데이터를 불러오는 데 실패했습니다.'));
    } finally {

      eventSourceRef.current?.close();
      dispatch(setSseConnected(false));
    }
  }, [dispatch]);

  const connectSse = useCallback(() => {
    if (!consultationId || !isTriggered) return;

    eventSourceRef.current?.close();

    const token = accessTokenRef.current;

    const baseUrl = `${window.location.origin}${env.apiBaseUrl}/notification/subscribe`;
    const finalUrl = token
      ? `${baseUrl}?accessToken=${token}`
      : baseUrl;

    const eventSource = new EventSource(finalUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {

      dispatch(setSseConnected(true));
      dispatch(setCurrentMessage('서버와 실시간 연결됨...'));
    };

    eventSource.addEventListener('connect', () => {

      dispatch(setSseConnected(true));
      dispatch(setCurrentMessage('심사 프로세스를 시작합니다...'));
    });

    eventSource.onmessage = () => {

    };

    eventSource.addEventListener('OCR_COMPLETED', (e: MessageEvent) => {

      const payload = JSON.parse(e.data);
      handleOcrCompleted(payload);
    });
    eventSource.addEventListener('OCR_FAILED', () => {
      dispatch(updateStepStatus({ step: 'ocr', status: 'ERROR', message: 'OCR 분석 실패' }));
      dispatch(addErrorMessage('OCR 처리에 실패했습니다.'));
    });

    eventSource.addEventListener('HOUSE_AUDIT_STARTED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(updateStepStatus({ step: 'houseAudit', status: 'LOADING', message: `주택 심사 시작: ${payload.data?.propertyAddress || ''}` }));
    });
    eventSource.addEventListener('HOUSE_AUDIT_COMPLETED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(setHouseAuditData(payload.data));
      dispatch(updateStepStatus({ step: 'houseAudit', status: 'SUCCESS', message: payload.message || '주택 심사 완료' }));
    });
    eventSource.addEventListener('HOUSE_AUDIT_FAILED', () => {
      dispatch(updateStepStatus({ step: 'houseAudit', status: 'ERROR', message: '주택 심사 실패' }));
      dispatch(addErrorMessage('주택 심사 중 오류가 발생했습니다.'));
    });

    eventSource.addEventListener('HOUSE_AUDIT_PRICE_CHECK_STARTED', () => dispatch(setCurrentMessage('주택 시세 조회 시작...')));
    eventSource.addEventListener('HOUSE_AUDIT_PRICE_CHECK_COMPLETED', () => dispatch(setCurrentMessage('주택 시세 조회 완료')));
    eventSource.addEventListener('HOUSE_AUDIT_PRICE_CHECK_FAILED', () => dispatch(addErrorMessage('주택 시세 조회 중 실패했습니다.')));
    eventSource.addEventListener('HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_STARTED', () => dispatch(setCurrentMessage('위반 건축물 검사 시작...')));
    eventSource.addEventListener('HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_COMPLETED', () => dispatch(setCurrentMessage('위반 건축물 검사 완료')));
    eventSource.addEventListener('HOUSE_AUDIT_ILLEGAL_BUILDING_CHECK_FAILED', () => dispatch(addErrorMessage('위반 건축물 검증에 실패했습니다.')));
    eventSource.addEventListener('HOUSE_AUDIT_NEAREST_BRANCH_CHECK_STARTED', () => dispatch(setCurrentMessage('관할 지점 확인 중...')));
    eventSource.addEventListener('HOUSE_AUDIT_NEAREST_BRANCH_CHECK_COMPLETED', () => dispatch(setCurrentMessage('관할 지점 조회 완료')));
    eventSource.addEventListener('HOUSE_AUDIT_NEAREST_BRANCH_CHECK_FAILED', () => dispatch(addErrorMessage('관할 지점 조회에 실패했습니다.')));

    eventSource.addEventListener('MY_DATA_AUDIT_STARTED', () => dispatch(setCurrentMessage('마이데이터 스크래핑 시작...')));
    eventSource.addEventListener('MY_DATA_AUDIT_COMPLETED', () => dispatch(setCurrentMessage('마이데이터 심사 전체 완료')));
    eventSource.addEventListener('MY_DATA_AUDIT_FAILED', () => dispatch(addErrorMessage('마이데이터 심사 통합 조회에 실패했습니다.')));
    eventSource.addEventListener('MY_DATA_MEMBER_LOOKUP_STARTED', () => dispatch(setCurrentMessage('마이데이터 회원 여부 조회 중...')));
    eventSource.addEventListener('MY_DATA_MEMBER_LOOKUP_COMPLETED', () => dispatch(setCurrentMessage('마이데이터 회원 확인 완료')));
    eventSource.addEventListener('MY_DATA_MEMBER_LOOKUP_FAILED', () => dispatch(addErrorMessage('마이데이터 회원 조회 중 오류가 발생했습니다.')));

    eventSource.addEventListener('MY_DATA_CREDIT_RATING_LOOKUP_STARTED', () => {
      dispatch(updateStepStatus({ step: 'credit', status: 'LOADING', message: '신용등급 조회 중...' }));
    });
    eventSource.addEventListener('MY_DATA_CREDIT_RATING_LOOKUP_COMPLETED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(setCreditData(payload.data));
      dispatch(updateStepStatus({ step: 'credit', status: 'SUCCESS', message: payload.message || '신용등급 조회 완료' }));
    });
    eventSource.addEventListener('MY_DATA_CREDIT_RATING_LOOKUP_FAILED', () => {
      dispatch(updateStepStatus({ step: 'credit', status: 'ERROR', message: '신용등급 조회 실패' }));
      dispatch(addErrorMessage('신용등급 조회에 실패했습니다.'));
    });

    eventSource.addEventListener('MY_DATA_LOAN_PRODUCTS_LOOKUP_STARTED', () => {
      dispatch(updateStepStatus({ step: 'loanHistory', status: 'LOADING', message: '기존 대출 내역 조회 중...' }));
    });
    eventSource.addEventListener('MY_DATA_LOAN_PRODUCTS_LOOKUP_COMPLETED', (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      dispatch(setLoanData(payload.data));
      dispatch(updateStepStatus({ step: 'loanHistory', status: 'SUCCESS', message: payload.message || '대출 내역 조회 완료' }));
    });
    eventSource.addEventListener('MY_DATA_LOAN_PRODUCTS_LOOKUP_FAILED', () => {
      dispatch(updateStepStatus({ step: 'loanHistory', status: 'ERROR', message: '대출 내역 조회 실패' }));
      dispatch(addErrorMessage('대출 내역 조회 중 오류가 발생했습니다.'));
    });

    eventSource.addEventListener('REPORT_COMPLETED', () => {

      handleReportCompleted();
    });

    eventSource.onerror = () => {

      if (eventSource.readyState === EventSource.CLOSED) {
        dispatch(setSseConnected(false));
        eventSource.close();
      }
    };

    return () => {
      eventSource.close();
      dispatch(setSseConnected(false));
    };
  }, [consultationId, isTriggered, dispatch, handleOcrCompleted, handleReportCompleted]);

  useEffect(() => {
    const cleanup = connectSse();
    return cleanup;
  }, [connectSse]);

  return { isSseConnected };
};