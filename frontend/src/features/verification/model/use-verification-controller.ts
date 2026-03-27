import { useState, useEffect, useMemo } from 'react';
import { mapServerResponseToVerificationResult } from '@/entities/verification/model/verification.mapper';
import { useAppSelector } from '@/app/store/hooks';
import { useVerificationActions } from './use-verification-actions';
import { 
  checkIsResolved, 
  calculateDocumentStatus,
  getNextDocumentId,
  getPrevDocumentId
} from '@/entities/verification/model/verification.logic';

/**
 * @feature verification/model/useVerificationController
 * 검증 페이지의 메인 로직을 총괄하는 컨트롤러 훅입니다.
 */
export const useVerificationController = () => {
  const [focusedFieldKey, setFocusedFieldKey] = useState<string | null>(null);

  // 1. Redux 및 API 레이어에서 데이터 수집
  const customerInfo = useAppSelector(state => state.customer.data);
  const counselId = customerInfo.counselId; // (S14-FIX) URL 대신 리덕스에서 ID를 가져옵니다.
  const edits = useAppSelector(state => state.verification.edits);
  const selectedId = useAppSelector(state => state.verification.activeDocumentId);
  
  // (S14-FIX) 서버 데이터 대신 Redux의 Audit 슬라이스를 소스로 사용합니다.
  const ocrData = useAppSelector(state => state.audit.data.ocrData);
  const ocrStatus = useAppSelector(state => state.audit.steps.ocr);

  // 기능(Action) 주입
  const { onFieldUpdate, onSelectDocument } = useVerificationActions();

  // 2. 상태 결정
  const isLoading = ocrStatus === 'LOADING' || ocrStatus === 'IDLE';
  const isError = ocrStatus === 'ERROR';

  // 3. 하이브리드 상태 계산 (Derived State)
  const localResult = useMemo(() => {
    if (!ocrData || !counselId) return null;
    
    // (A) 초기 매핑: 서버 응답 객체를 UI에 적합한 트리/맵 구조로 변환
    const result = mapServerResponseToVerificationResult(ocrData, counselId);
    
    // (B) Redux 수정본 적용 (Multi-Document 지원)
    Object.entries(edits).forEach(([docId, docEdits]) => {
      const targetFields = result.documentFields[docId];
      if (targetFields) {
        Object.entries(docEdits.values).forEach(([path, value]) => {
          const field = targetFields.find(f => f.key === path);
          if (field) {
            field.value = value as string | number | boolean | null; 
            field.isModified = true;
            
            field.isMatch = checkIsResolved(
              path, 
              String(value), 
              customerInfo, 
              result.errorTargetDict, 
              result.documentFields,
              docId
            );
          }
        });
        
        const doc = result.documents[docId];
        if (doc) {
          const { status, isRisk } = calculateDocumentStatus(
            targetFields, 
            doc.documentClassification.documentType, 
            result.missingSet
          );
          doc.status = status;
          doc.isRisk = isRisk;
        }
      }
    });

    return result;
  }, [ocrData, edits, customerInfo, counselId]);

  // (Why: 선택된 문서가 없을 경우 첫 번째 유효한 문서를 자동으로 활성화합니다.)
  useEffect(() => {
    if (localResult && !selectedId) {
      onSelectDocument(localResult.selectedDocId);
    }
  }, [localResult, selectedId, onSelectDocument]);

  const handleNextDocument = () => {
    if (!localResult || !selectedId) return;
    const nextId = getNextDocumentId(selectedId, localResult.categories, localResult.documents);
    if (nextId) {
      onSelectDocument(nextId);
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
      onSelectDocument(prevId);
      setTimeout(() => {
        const prevButton = document.querySelector(`button[data-doc-id="${prevId}"]`) as HTMLButtonElement | null;
        if (prevButton) prevButton.focus();
      }, 30);
    }
  };

  return {
    localResult,
    selectedId,
    isLoading,
    isError,
    focusedFieldKey,
    counselId, // Page에서 필요할 수 있으므로 반환합니다.
    setSelectedId: onSelectDocument, 
    setFocusedFieldKey,
    handleFieldChange: onFieldUpdate,
    handleNextDocument,
    handlePrevDocument
  };
};
