import { useMemo, useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { useAgentFiles } from '../api/use-agent-files';
import { documentMapper } from '@/entities/loan-document/model/document.mapper';
import { Document } from '@/entities/loan-document/model/types';

interface UseAgentDocsResult {
  docs: Document[];
  isPollingActive: boolean;
  isScanComplete: boolean;
}

/**
 * @feature DocumentSync
 * 에이전트로부터 폴링한 원시 데이터를 도메인 모델(Document)로 변환하고,
 * 5초간 무활동 시 스캔 완료(isScanComplete) 상태를 관리하는 커스텀 훅입니다.
 */
export const useAgentDocs = (): UseAgentDocsResult => {
  // 1. 전역 상태에서 폴링 활성화 여부 구독
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);

  // 2. 에이전트 파일 목록 폴링 (원시 데이터)
  const { data: agentFiles } = useAgentFiles(isPollingActive);

  // 3. 도메인 모델로 매핑
  const docs = useMemo(() => {
    if (!agentFiles) return [];
    return agentFiles.map(documentMapper.toDomainFromAgent);
  }, [agentFiles]);

  // 4. 스캔 완료(Idle) 타이머 상태 관리 로직
  const [isScanComplete, setIsScanComplete] = useState(false);
  const lastFilesCountRef = useRef(0);
  const lastDetectionTimeRef = useRef(Date.now());

  // 데이터(서류 개수)가 변할 때마다 마지막 감지 시간을 리셋
  useEffect(() => {
    if (docs.length > 0 && docs.length !== lastFilesCountRef.current) {
      lastFilesCountRef.current = docs.length;
      lastDetectionTimeRef.current = Date.now();
      setIsScanComplete(false);
      console.log(`[Scan] New file detected. Count: ${docs.length}. Timer reset.`);
    }
  }, [docs.length]);

  // 폴링 상태가 활성화되어 있고 서류가 있을 때, 1초마다 대기 시간 추적
  useEffect(() => {
    if (!isPollingActive || docs.length === 0) {
      setIsScanComplete(false);
      lastFilesCountRef.current = docs.length;
      return;
    }

    if (isScanComplete) return;

    const timer = setInterval(() => {
      const idleTime = Date.now() - lastDetectionTimeRef.current;
      if (idleTime > 5000) {
        console.log('[Scan] 5 seconds of idle detected. Marking scan as complete.');
        setIsScanComplete(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [docs.length, isPollingActive, isScanComplete]);

  return {
    docs,
    isPollingActive,
    isScanComplete,
  };
};
