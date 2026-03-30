import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';
import { VerificationRepository } from '@/widgets/verification-repository/ui/VerificationRepository';
import { OcrFieldEditor } from '@/widgets/ocr-field-editor/ui/OcrFieldEditor';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';
import { useState, useEffect } from 'react';
import { useVerificationController } from '@/features/verification/model/use-verification-controller';
import { useGlobalFocusRecovery } from '@/features/verification/model/use-global-focus-recovery';
import { useCrossWindowSync } from '@/features/verification/model/use-cross-window-sync';
import { DeadEndPopup } from '@/features/verification/ui/DeadEndPopup';
import { OcrWaitModal } from '@/features/verification/ui/OcrWaitModal';
import { useVerificationStatus } from '@/features/verification/model/use-verification-status';
import { useVerificationActions } from '@/features/verification/model/use-verification-actions';

export const VerificationResultPage = () => {
  const {
    localResult,
    selectedId,
    isLoading: isControllerLoading,
    focusedFieldKey,
    consultationId,
    setSelectedId,
    setFocusedFieldKey,
    handleFieldChange,
    handleNextDocument,
    handlePrevDocument
  } = useVerificationController();

  const { isBlocked, isLoading: isStatusLoading } = useVerificationStatus();
  const { handleNextStep } = useVerificationActions();
  const isLoading = isControllerLoading || isStatusLoading;

  useGlobalFocusRecovery({
    handleNextDocument,
    handlePrevDocument
  });

  const [scale, setScale] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    setPageNumber(1);
    setScale(1);
  }, [selectedId]);

  useCrossWindowSync({
    role: 'sender',
    state: {
      selectedId,
      pageNumber,
      scale,
      focusedFieldKey
    }
  });

  const nextStepButton = {
    label: isBlocked ? '진행 불가 (서류 누락)' : '검증 완료 및 다음 단계로',
    onClick: handleNextStep,
    disabled: isBlocked || isLoading,
    className: isBlocked ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-[#004b93] text-white'
  };

  if (isLoading || !localResult) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
        <Header />
        <main className="flex-1 min-h-0 p-4 space-y-4 flex flex-col overflow-hidden">
          <section className="shrink-0"><LoanStepper /></section>
          <section className="shrink-0"><CustomerInfoForm /></section>
          <section className="shrink-0">
            <LoanTabs actionButton={nextStepButton} />
          </section>
          <div className="flex-1 flex flex-col items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-[0.5em] py-20 gap-4">
            <div className="text-xl">Analyzing Document Consistency...</div>
            <div className="text-[10px] font-normal tracking-tight lowercase">Please wait for AI verification</div>
          </div>
        </main>
        <OcrWaitModal />
      </div>
    );
  }

  const selectedDoc = selectedId ? localResult.documents[selectedId] : undefined;

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
      <Header />

      <main className="flex-1 min-h-0 p-4 space-y-4 flex flex-col overflow-hidden">
        <section className="shrink-0">
          <LoanStepper />
        </section>

        <section className="shrink-0">
          <CustomerInfoForm />
        </section>

        <section className="shrink-0">
          <LoanTabs actionButton={nextStepButton} />
        </section>

        <section className="flex-1 min-h-0 flex overflow-hidden border border-gray-300 bg-white rounded-sm">
          <VerificationRepository
            categories={localResult.categories}
            documents={localResult.documents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRequestNextDocument={handleNextDocument}
            onRequestPrevDocument={handlePrevDocument}
          />

          <OcrFieldEditor
            fields={selectedId ? (localResult.documentFields[selectedId] || []) : []}
            status={selectedDoc?.status || 'APPROVED'}
            isRisk={selectedDoc?.isRisk}
            selectedId={selectedId}
            onFieldChange={(key, value) => {
              if (selectedId) handleFieldChange(selectedId, key, value);
            }}
            onFocus={setFocusedFieldKey}
            onRequestNextDocument={handleNextDocument}
          />

          <DocumentImageViewer
            key={selectedId}
            fields={selectedId ? (localResult.documentFields[selectedId] || []) : []}
            focusedFieldKey={focusedFieldKey}
            fileUrl={selectedDoc?.fileUrl}
            files={selectedDoc?.files}
            scale={scale}
            pageNumber={pageNumber}
            onScaleChange={setScale}
            onPageChange={setPageNumber}
            verificationId={consultationId || ''}
          />
        </section>
      </main>

      <DeadEndPopup />
      <OcrWaitModal />
    </div>
  );
};