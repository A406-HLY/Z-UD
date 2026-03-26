import { useState, useEffect, useMemo } from 'react';
import { useVerificationQuery } from '@/features/verification/api/use-verification-query';
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
 * (Why: 단일 컴포넌트(Page)가 모든 비즈니스 로직을 감당하지 않도록 제어 로직을 훅으로 격리합니다.)
 * 
 * [Refactor]
 * - 기존: 로컬 useState로 수정 데이터 관리 (새로고침/이동 시 유실)
 * - 현재: Redux 'verification' 슬라이스와 TanStack Query를 결합한 하이브리드 상태 관리 방식 적용
 */
export const useVerificationController = (verificationId: string) => {
  const [focusedFieldKey, setFocusedFieldKey] = useState<string | null>(null);

  // 1. Redux 및 API 레이어에서 데이터 수집
  const customerInfo = useAppSelector(state => state.customer.data);
  const edits = useAppSelector(state => state.verification.edits);
  const selectedId = useAppSelector(state => state.verification.activeDocumentId);
  
  // 기능(Action) 주입
  const { onFieldUpdate, onSelectDocument } = useVerificationActions();

  // 2. 서버 데이터 Fetching
  const { data: serverResponse, isLoading } = useVerificationQuery(verificationId);

  // 3. 하이브리드 상태 계산 (Derived State)
  // (Why: 원본 데이터의 불변성을 유지하면서 사용자의 수정을 '덮어씌워' 최종 결과물을 동적으로 생성합니다.)
  const localResult = useMemo(() => {
    if (!serverResponse) return null;
    
    // (A) 초기 매핑: 서버 응답 객체를 UI에 적합한 트리/맵 구조로 변환
    const result = mapServerResponseToVerificationResult(serverResponse, verificationId);
    
    // (B) Redux 수정본 적용 (Multi-Document 지원)
    Object.entries(edits).forEach(([docId, docEdits]) => {
      const targetFields = result.documentFields[docId];
      if (targetFields) {
        Object.entries(docEdits.values).forEach(([path, value]) => {
          const field = targetFields.find(f => f.key === path);
          if (field) {
            field.value = value;
            field.isModified = true;
            
            // 필드 레벨 정합성 재판단 (Branch A/B 로직 재사용)
            field.isMatch = checkIsResolved(
              path, 
              value, 
              customerInfo, 
              result.errorTargetDict, 
              result.documentFields,
              docId
            );
          }
        });
        
        // 문서 단위 최종 상태(status, isRisk) 재계산
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
  }, [serverResponse, edits, customerInfo, verificationId]);

  // (Why: 선택된 문서가 없을 경우 첫 번째 유효한 문서를 자동으로 활성화합니다.)
  useEffect(() => {
    if (localResult && !selectedId) {
      onSelectDocument(localResult.selectedDocId);
    }
  }, [localResult, selectedId, onSelectDocument]);

  /** 
   * 문서 간 이동 핸들러 
   * (Note: UI 상태인 setSelectedId 대신 Redux 액션인 onSelectDocument를 사용합니다.)
   */
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
    focusedFieldKey,
    setSelectedId: onSelectDocument, 
    setFocusedFieldKey,
    handleFieldChange: onFieldUpdate,
    handleNextDocument,
    handlePrevDocument
  };
};
