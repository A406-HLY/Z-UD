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

/**
 * @page verification-result
 * 서류 검증 결과 및 OCR 교정을 수행하는 업무 페이지입니다.
 */
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

  // (Why: 전역 포커스 감시 로직을 훅으로 격리하여 페이지(UI) 코드를 조립 역할에 집중시킵니다.)
  useGlobalFocusRecovery({
    handleNextDocument,
    handlePrevDocument
  });

  // (Why: 크로스 윈도우 동기화를 위한 로컬 상태 관리 - 기본 배율은 가독성을 위해 80%로 설정합니다.)
  const [scale, setScale] = useState(0.8);
  const [pageNumber, setPageNumber] = useState(1);

  // (Why: 문서가 변경되면 페이지 번호(1)와 배율(80%)을 초기화합니다.)
  useEffect(() => {
    setPageNumber(1);
    setScale(0.8);
  }, [selectedId]);

  // (Why: 메인 창에서 발생하는 모든 뷰어 상태 변경을 BroadcastChannel로 송신합니다.)
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
        {/* [WHY: 데이터가 아직 로드되지 않았을 때 실시간 SSE 진행 상황을 보여주는 분석 모달] */}
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
          {/* 좌측: 서류 트리 (실시간 상태 반영) */}
          <VerificationRepository 
            categories={localResult.categories} 
            documents={localResult.documents}
            selectedId={selectedId} 
            onSelect={setSelectedId}
            onRequestNextDocument={handleNextDocument}
            onRequestPrevDocument={handlePrevDocument}
          />
          
          {/* 중앙: 실시간 교차 검증 에디터 */}
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
          
          {/* 우측: 원본 서류 이미지 뷰어 */}
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

      {/* [WHY: 필수 서류 누락 시 전역적으로 차단하는 전산 팝업] */}
      <DeadEndPopup />
      {/* [WHY: 실시간 SSE 진행 상황을 보여주는 분석 모달 (상태에 따라 자동 노출)] */}
      <OcrWaitModal />
    </div>
  );
};
