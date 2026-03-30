import { useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { validateEssentialDocs } from '@/entities/verification/lib/doc-validator';
import { useMemo } from 'react';
import { aggregateFromDocuments } from '@/entities/verification/model/report-factory';

export const useVerificationStatus = () => {
  useParams<{ consultationId: string }>();

  const ocrData = useAppSelector(state => state.audit.data.ocrData);
  const ocrStatus = useAppSelector(state => state.audit.steps.ocr);

  const isLoading = ocrStatus === 'LOADING' || ocrStatus === 'IDLE';
  const isError = ocrStatus === 'ERROR';

  const employmentType = useAppSelector((state) => state.customer.data.employmentType);

  const validationResult = ocrData?.validationResult;
  const { isBlocked: isMissingBlocked, essentialMissings, otherMissings } = validateEssentialDocs(
    validationResult?.documentMissings || [],
    employmentType
  );

  const isViolationBuilding = useMemo(() => {
    if (!ocrData?.documents) return false;
    return aggregateFromDocuments(ocrData.documents).isViolationBuilding === true;
  }, [ocrData]);

  const isBlocked = isMissingBlocked || isViolationBuilding;
  const terminationReason = isViolationBuilding
    ? "위반건축물입니다. 심사를 종료합니다."
    : "필수 서류 누락";

  return {

    isLoading,

    isError,

    isBlocked,

    terminationReason,

    essentialMissings,

    otherMissings,

    originalData: ocrData,
  };
};