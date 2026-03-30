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

export const useVerificationController = () => {
  const [focusedFieldKey, setFocusedFieldKey] = useState<string | null>(null);

  const customerInfo = useAppSelector(state => state.customer.data);
  const consultationId = customerInfo.consultationId;
  const edits = useAppSelector(state => state.verification.edits);
  const selectedId = useAppSelector(state => state.verification.activeDocumentId);

  const ocrData = useAppSelector(state => state.audit.data.ocrData);
  const ocrStatus = useAppSelector(state => state.audit.steps.ocr);

  const { onFieldUpdate, onSelectDocument } = useVerificationActions();

  const isLoading = ocrStatus === 'LOADING' || ocrStatus === 'IDLE';
  const isError = ocrStatus === 'ERROR';

  const localResult = useMemo(() => {
    if (!ocrData || !consultationId) return null;

    const result = mapServerResponseToVerificationResult(ocrData, consultationId);

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
  }, [ocrData, edits, customerInfo, consultationId, ocrStatus]);

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
    consultationId,
    setSelectedId: onSelectDocument,
    setFocusedFieldKey,
    handleFieldChange: onFieldUpdate,
    handleNextDocument,
    handlePrevDocument
  };
};