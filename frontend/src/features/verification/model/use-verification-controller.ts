import { useState, useEffect } from 'react';
import { useVerificationQuery } from '@/features/verification/api/use-verification-query';
import { mapServerResponseToVerificationResult } from '@/entities/verification/model/verification.mapper';
import { VerificationResult } from '@/entities/verification/model/types';
import { useAppSelector } from '@/app/store/hooks';
import { 
  checkIsResolved, 
  calculateDocumentStatus 
} from './verification-logic';

/**
 * @feature verification
 * 서류 검증 퍼널의 실시간 정합성 판정 및 통합 데이터 관리를 책임지는 Controller Hook 입니다.
 * (Why: Page 컴포넌트는 UI 조립에 집중해야 하므로, 데이터 Fetching 및 상태 변경 비즈니스 로직을 이 훅으로 격리합니다.)
 */
export const useVerificationController = (verificationId: string) => {
  const [selectedId, setSelectedId] = useState('item-1');
  const [localResult, setLocalResult] = useState<VerificationResult | null>(null);

  // 1. Redux에서 전역 고객 원천 데이터(기준 정답) 가져오기
  const customerInfo = useAppSelector(state => state.customer.data);

  // 2. 서버 데이터 Fetching
  const { data: serverResponse, isLoading } = useVerificationQuery(verificationId);

  useEffect(() => {
    if (serverResponse) {
      const initialResult = mapServerResponseToVerificationResult(serverResponse, verificationId);
      setLocalResult(initialResult);
      setSelectedId(initialResult.selectedDocId);
    }
  }, [serverResponse, verificationId]);

  /** 
   * 실시간 정합성 판정 및 상태 연쇄 업데이트 핸들러
   * (Why: 필드 수정 시 원장 데이터 대조 및 교차 검증을 수행하고, 연관된 모든 문서의 상태를 실시간으로 재계산합니다)
   */
  const handleFieldChange = (key: string, value: string) => {
    if (!localResult) return;

    setLocalResult(prev => {
      if (!prev) return null;
      
      const newDocumentFields = { ...prev.documentFields };
      
      // 단계 1: 대조 결과(isResolved) 판정 (추출된 로직 활용)
      const isResolved = checkIsResolved(
        key, 
        value, 
        customerInfo, 
        prev.errorTargetDict, 
        newDocumentFields, 
        selectedId
      );

      // 단계 2: 연쇄 업데이트 (Cascading Update)
      const newDocuments = { ...prev.documents };
      const targetDocIdsToUpdate = new Set<string>();
      
      Object.keys(newDocumentFields).forEach(docId => {
        if (newDocumentFields[docId].some(f => f.key === key)) {
          targetDocIdsToUpdate.add(docId);
        }
      });
      
      targetDocIdsToUpdate.forEach(docId => {
        if (newDocumentFields[docId]) {
          const updatedFields = newDocumentFields[docId].map(f => {
            if (f.key === key) {
              return { 
                ...f, 
                value: docId === selectedId ? value : f.value, 
                isMatch: isResolved,                           
                isModified: docId === selectedId ? true : f.isModified
              };
            }
            return f;
          });
          
          newDocumentFields[docId] = updatedFields;

          // 단계 3: 문서 상태 재계산 (추출된 로직 활용)
          const docType = newDocuments[docId].documentClassification.documentType;
          const { status, isRisk } = calculateDocumentStatus(updatedFields, docType, prev.missingSet);

          newDocuments[docId] = {
            ...newDocuments[docId],
            status,
            isRisk
          };
        }
      });

      return {
        ...prev,
        documents: newDocuments,
        documentFields: newDocumentFields
      };
    });
  };

  return {
    localResult,
    selectedId,
    isLoading,
    setSelectedId,
    handleFieldChange
  };
};
