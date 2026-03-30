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

export const useAgentDocs = (): UseAgentDocsResult => {
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);

  const { data: agentFiles } = useAgentFiles(isPollingActive);

  const docs = useMemo(() => {
    if (!agentFiles) return [];
    return agentFiles.map(documentMapper.toDomainFromAgent);
  }, [agentFiles]);

  const [isScanComplete, setIsScanComplete] = useState(false);
  const lastFilesCountRef = useRef(0);
  const lastDetectionTimeRef = useRef(Date.now());

  useEffect(() => {
    if (docs.length > 0 && docs.length !== lastFilesCountRef.current) {
      lastFilesCountRef.current = docs.length;
      lastDetectionTimeRef.current = Date.now();
      setIsScanComplete(false);

    }
  }, [docs.length]);

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