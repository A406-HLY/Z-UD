import { Header } from '@/widgets/header/ui/Header';
import { CustomerInfoForm } from '@/widgets/customer-info-form/ui/CustomerInfoForm';
import { LoanTabs } from '@/widgets/loan-tabs/ui/LoanTabs';
import { DocumentViewer } from '@/widgets/document-viewer/ui/DocumentViewer';
import { PollingStatusToast } from '@/entities/customer/ui/PollingStatusToast';

/**
 * @page LoanApplicationPage
 * 대출 신청 메인 페이지 (기초 정보 입력 단계)입니다.
 * (Why) 페이지 레벨에서는 직접적인 상태 관리를 지양하고, 하위 위젯들이 독립적으로 전역 상태(Redux)를 구독하도록 구성하여 레이아웃 역할에 집중합니다.
 */
export const LoanApplicationPage = () => {
  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden relative">
      {/* (Why) 전체 브라우저 스크롤을 방지하고 내부 위젯(뷰어)만 스크롤 가능하게 하기 위해 h-screen과 overflow-hidden을 사용합니다. */}
      {/* 전역 상태 팝업 */}
      <PollingStatusToast />
      
      {/* 1. 고정 헤더 */}
      <Header />

      {/* 2. 메인 콘텐츠 영역 (Flex Container) */}
      {/* (Why) 상단 폼은 고정하고 하단 서류 뷰어가 남는 공간을 모두 차지하도록 flex-col 및 min-h-0 구성을 적용합니다. */}
      <main className="flex-1 p-4 space-y-4 flex flex-col min-h-0 overflow-hidden">
        {/* 고객 기본정보 입력 영역 */}
        <section className="shrink-0">
          <CustomerInfoForm />
        </section>

        {/* 프로세스 탭 바 */}
        <section className="shrink-0">
          <LoanTabs />
        </section>

        {/* 서류 뷰어/콘솔 영역 (Flex-1) */}
        <section className="flex-1 min-h-0">
          <DocumentViewer />
        </section>
      </main>
    </div>
  );
};

export default LoanApplicationPage;
