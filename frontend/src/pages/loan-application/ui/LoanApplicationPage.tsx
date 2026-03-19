import { useState } from 'react';
import { Header } from '@/widgets/header/ui/Header';
import { CustomerInfoForm } from '@/widgets/customer-info-form/ui/CustomerInfoForm';
import { LoanTabs } from '@/widgets/loan-tabs/ui/LoanTabs';
import { DocumentViewer } from '@/widgets/document-viewer/ui/DocumentViewer';

/**
 * @page LoanApplicationPage
 * 대출 신청 메인 페이지 (기초 정보 입력 단계)입니다.
 * (Why) 고객 정보 입력과 서류 감지 상태를 한 배너에서 관리하기 위해 상위 페이지에서 폴링 상태를 유지합니다.
 */
export const LoanApplicationPage = () => {
  const [isPollingActive, setIsPollingActive] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 1. 고정 헤더 */}
      <Header />

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="flex-1 p-4 space-y-4">
        {/* 고객 기본정보 입력 영역 */}
        <section>
          <CustomerInfoForm 
            isPollingActive={isPollingActive}
            onTogglePolling={() => setIsPollingActive(!isPollingActive)} 
          />
        </section>

        {/* 프로세스 탭 바 */}
        <section>
          <LoanTabs />
        </section>

        {/* 서류 뷰어/콘솔 영역 */}
        <section>
          <DocumentViewer isPollingActive={isPollingActive} />
        </section>
      </main>
    </div>
  );
};

export default LoanApplicationPage;
