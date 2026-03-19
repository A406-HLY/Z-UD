import { Header } from '@/widgets/header/ui/Header';
import { CustomerInfoForm } from '@/widgets/customer-info-form/ui/CustomerInfoForm';
import { LoanTabs } from '@/widgets/loan-tabs/ui/LoanTabs';
import { DocumentViewer } from '@/widgets/document-viewer/ui/DocumentViewer';

/**
 * @page LoanApplicationPage
 * 대출 신청 메인 페이지 (기초 정보 입력 단계)입니다.
 * (Why) 페이지 레벨에서는 직접적인 상태 관리를 지양하고, 하위 위젯들이 독립적으로 전역 상태(Redux)를 구독하도록 구성하여 레이아웃 역할에 집중합니다.
 */
export const LoanApplicationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 1. 고정 헤더 */}
      <Header />

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="flex-1 p-4 space-y-4">
        {/* 고객 기본정보 입력 영역 (내부적으로 Redux 구독) */}
        <section>
          <CustomerInfoForm />
        </section>

        {/* 프로세스 탭 바 */}
        <section>
          <LoanTabs />
        </section>

        {/* 서류 뷰어/콘솔 영역 (내부적으로 Redux 구독) */}
        <section>
          <DocumentViewer />
        </section>
      </main>
    </div>
  );
};

export default LoanApplicationPage;
