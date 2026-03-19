import { useState } from 'react';
import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { VerificationRepository } from '@/widgets/verification-repository/ui/VerificationRepository';
import { OcrFieldEditor } from '@/widgets/ocr-field-editor/ui/OcrFieldEditor';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';
import { useVerificationQuery } from '@/features/verification/api/use-verification-query';

/**
 * @page verification-result
 * 서류 검증 결과 및 OCR 교정을 수행하는 업무 페이지입니다.
 */
export const VerificationResultPage = () => {
  // 현재 선택된 서류 항목 ID 상태 (Why: 좌측 Repository와 중앙 Editor 간의 데이터 정합성 유지)
  const [selectedId, setSelectedId] = useState('item-1');
  
  // 데이터 조회 (TanStack Query)
  const { data: result, isLoading } = useVerificationQuery('v-12345');

  /** 데이터 로딩 중 폴백 UI */
  if (isLoading || !result) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header />
        <main className="flex-1 p-4 space-y-4">
          <section><CustomerInfoForm /></section>
          <section><LoanTabs /></section>
          <div className="flex-1 flex items-center justify-center font-black text-gray-300 animate-pulse uppercase tracking-[0.5em] py-20">
            Accessing Secure Scan Data...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* 1. 상단 글로벌 헤더 */}
      <Header />
      
      <main className="flex-1 p-4 space-y-4">
        {/* 2. 회원정보바 */}
        <section>
          <CustomerInfoForm />
        </section>
        
        {/* 3. 프로세스 네비게이션 탭 */}
        <section>
          <LoanTabs />
        </section>
        
        {/* 4. 메인 업무 영역: 3분할 레이아웃 */}
        <section className="h-[600px] flex overflow-hidden border border-gray-300 bg-white rounded-sm">
          {/* 좌측: 서류 트리 */}
          <VerificationRepository 
            categories={result.categories} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
          
          {/* 중앙: OCR 데이터 교정 */}
          <OcrFieldEditor data={result.extractedData} />
          
          {/* 우측: 원본 서류 이미지 뷰어 */}
          <DocumentImageViewer />
        </section>
      </main>
    </div>
  );
};
