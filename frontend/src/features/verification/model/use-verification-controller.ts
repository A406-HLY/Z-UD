import { useState, useEffect } from 'react';
import { useVerificationQuery } from '@/features/verification/api/use-verification-query';
import { mapServerResponseToVerificationResult } from '@/entities/verification/model/verification.mapper';
import { VerificationResult } from '@/entities/verification/model/types';
import { useAppSelector } from '@/app/store/hooks';
import { 
  checkIsResolved, 
  calculateDocumentStatus,
  isCustomerInfoField,
  getNextDocumentId,
  getPrevDocumentId
} from '@/entities/verification/model/verification.logic';
export const useVerificationController = (verificationId: string) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localResult, setLocalResult] = useState<VerificationResult | null>(null);
  const [focusedFieldKey, setFocusedFieldKey] = useState<string | null>(null);

  // 1. Redux에서 전역 고객 원천 데이터(기준 정답) 가져오기
  const customerInfo = useAppSelector(state => state.customer.data);

  // 2. 서버 데이터 Fetching
  const { data: serverResponse, isLoading } = useVerificationQuery(verificationId);

  useEffect(() => {
    // (Why: 사용자가 이미 수정을 시작했거나 초기화된 경우, 백그라운드 Refetch에 의해 데이터가 덮어씌워지는 것을 방지합니다.)
    if (serverResponse && !localResult) {
      const initialResult = mapServerResponseToVerificationResult(serverResponse, verificationId);
      setLocalResult(initialResult);
      setSelectedId(initialResult.selectedDocId);
    }
  }, [serverResponse, verificationId, localResult]);

  /** 
   * 실시간 정합성 판정 및 상태 연쇄 업데이트 핸들러
   * (Why: 필드 수정 시 원장 데이터 대조 및 교차 검증을 수행하고, 연관된 모든 문서의 상태를 실시간으로 재계산합니다)
   */
  const handleFieldChange = (key: string, value: string) => {
    if (!localResult || !selectedId) return;

    setLocalResult(prev => {
      if (!prev) return null;
      
      const newDocumentFields = { ...prev.documentFields };
      
      // 단계 1: 대조 결과(isResolved) 판정 (추출된 로직 활용)
      const globalIsResolved = checkIsResolved(
        key, 
        value, 
        customerInfo, 
        prev.errorTargetDict, 
        newDocumentFields, 
        selectedId
      );

      const isBranchA = isCustomerInfoField(key);

      // 단계 2: 연쇄 업데이트 (Cascading Update)
      const newDocuments = { ...prev.documents };
      
      // (Why: 모든 문서를 전수조사하는 대신, 현재 수정 중인 서류와 인덱싱된 위반 서류들(errorTargetDict)만 선별적으로 업데이트하여 성능을 최적화합니다.)
      const targetDocIdsToUpdate = new Set(prev.errorTargetDict[key] || []);
      targetDocIdsToUpdate.add(selectedId);
      
      targetDocIdsToUpdate.forEach(docId => {
        if (newDocumentFields[docId]) {
          const updatedFields = newDocumentFields[docId].map(f => {
            if (f.key === key) {
              const newValue = docId === selectedId ? value : String(f.value);
              let fieldIsResolved = globalIsResolved;

              // (Why: 서류 간 상호 대조(Branch B)는 전역 상태를 공유하지만,
              // 고객 정보 대조(Branch A)는 각 문서의 값이 원장과 일치하는지 독립적으로 판단해야 합니다.)
              if (isBranchA && docId !== selectedId) {
                fieldIsResolved = checkIsResolved(key, newValue, customerInfo, prev.errorTargetDict, newDocumentFields, docId);
              }

              return { 
                ...f, 
                value: newValue, 
                isMatch: fieldIsResolved,                           
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

  const handleNextDocument = () => {
    if (!localResult || !selectedId) return;
    const nextId = getNextDocumentId(selectedId, localResult.categories, localResult.documents);
    if (nextId) {
      setSelectedId(nextId);
      setTimeout(() => {
        const nextButton = document.querySelector(`button[data-doc-id="${nextId}"]`) as HTMLButtonElement | null;
        if (nextButton) nextButton.focus();
      }, 30);
    }
  };

  const handlePrevDocument = () => {
    if (!localResult || !selectedId) return;
    const prevId = getPrevDocumentId(selectedId, localResult.categories, localResult.documents);
    if (prevId) {
      setSelectedId(prevId);
      setTimeout(() => {
        const prevButton = document.querySelector(`button[data-doc-id="${prevId}"]`) as HTMLButtonElement | null;
        if (prevButton) prevButton.focus();
      }, 30);
    }
  };

  return {
    localResult,
    selectedId: selectedId as string | null,
    isLoading,
    focusedFieldKey,
    setSelectedId,
    setFocusedFieldKey,
    handleFieldChange,
    handleNextDocument,
    handlePrevDocument
  };
};
