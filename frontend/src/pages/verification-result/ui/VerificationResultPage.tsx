import { useEffect } from 'react';
import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';
import { VerificationRepository } from '@/widgets/verification-repository/ui/VerificationRepository';
import { OcrFieldEditor } from '@/widgets/ocr-field-editor/ui/OcrFieldEditor';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';
import { useVerificationController } from '@/features/verification/model/use-verification-controller';
import { useGlobalFocusRecovery } from '@/features/verification/model/use-global-focus-recovery';

/**
 * @page verification-result
 * 서류 검증 결과 및 OCR 교정을 수행하는 업무 페이지입니다.
 */
export const VerificationResultPage = () => {
  const { 
    localResult, 
    selectedId, 
    isLoading, 
    focusedFieldKey,
    setSelectedId, 
    setFocusedFieldKey,
    handleFieldChange,
    handleNextDocument,
    handlePrevDocument
  } = useVerificationController('v-12345');

  // (Why: 전역 포커스 감시 로직을 훅으로 격리하여 페이지(UI) 코드를 조립 역할에 집중시킵니다.)
  useGlobalFocusRecovery({
    handleNextDocument,
    handlePrevDocument
  });

  if (isLoading || !localResult) {

    return (
      <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
        <Header />
        <main className="flex-1 min-h-0 p-4 space-y-4 flex flex-col overflow-hidden">
          <section className="shrink-0"><LoanStepper /></section>
          <section className="shrink-0"><CustomerInfoForm /></section>
          <section className="shrink-0"><LoanTabs /></section>
          <div className="flex-1 flex items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-[0.5em] py-20">
            Analyzing Document Consistency...
          </div>
        </main>
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
          <LoanTabs />
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
            onFieldChange={handleFieldChange}
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
            originalWidth={selectedDoc?.resolution?.width}
            originalHeight={selectedDoc?.resolution?.height}
          />
        </section>
      </main>
    </div>
  );
};
