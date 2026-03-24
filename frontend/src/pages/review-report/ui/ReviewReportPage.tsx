import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';

/**
 * @page review-report
 * 심사레포트 단계 (임시 목업)
 * (Why: 페이지 이동 및 레이아웃 확인을 위한 최소 구현)
 */
export const ReviewReportPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 p-4 space-y-4">
        <section>
          <LoanStepper />
        </section>
        
        <section>
          <CustomerInfoForm />
        </section>

        <section>
          <LoanTabs />
        </section>

        <section>
          <div className="p-10 text-center bg-white border border-gray-200 rounded-sm">
            심사 레포트 페이지 준비 중
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReviewReportPage;
