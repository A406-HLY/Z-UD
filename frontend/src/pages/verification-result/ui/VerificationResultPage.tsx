import { useEffect } from 'react';
import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { VerificationRepository } from '@/widgets/verification-repository/ui/VerificationRepository';
import { OcrFieldEditor } from '@/widgets/ocr-field-editor/ui/OcrFieldEditor';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';
import { useVerificationController } from '@/features/verification/model/use-verification-controller';

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

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const active = document.activeElement;
        const isBody = active === document.body;
        const isManagedInput = active?.hasAttribute('data-document-id');
        const isSidebarButton = active?.hasAttribute('data-doc-id');

        if (isBody || (!isManagedInput && !isSidebarButton)) {
          const isInputWork = ['INPUT', 'SELECT', 'TEXTAREA'].includes(active?.tagName || '');
          if (!isInputWork) {
            e.preventDefault();
            if (!e.shiftKey) {
              handleNextDocument();
            } else {
              handlePrevDocument();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleNextDocument, handlePrevDocument]);

  if (isLoading || !localResult) {

    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header />
        <main className="flex-1 p-4 space-y-4">
          <section><CustomerInfoForm /></section>
          <section><LoanTabs /></section>
          <div className="flex-1 flex items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-[0.5em] py-20">
            Analyzing Document Consistency...
          </div>
        </main>
      </div>
    );
  }

  const selectedDoc = selectedId ? localResult.documents[selectedId] : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      
      <main className="flex-1 p-4 space-y-4">
        <section>
          <CustomerInfoForm />
        </section>
        
        <section>
          <LoanTabs />
        </section>
        
        <section className="h-[600px] flex overflow-hidden border border-gray-300 bg-white rounded-sm">
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
            fields={selectedId ? (localResult.documentFields[selectedId] || []) : []}
            focusedFieldKey={focusedFieldKey}
            originalWidth={selectedDoc?.resolution?.width}
          />
        </section>
      </main>
    </div>
  );
};
