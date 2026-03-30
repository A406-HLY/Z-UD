import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';

interface NotFoundPageProps {
  title: string;
  step: string;
}

export const NotFoundPage = ({ title, step }: NotFoundPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 p-4 space-y-4">
        <section>
          <CustomerInfoForm />
        </section>

        <section>
          <LoanTabs />
        </section>

        <section className="flex flex-col items-center justify-center py-12">
          <div className="max-w-md w-full bg-white border border-gray-300 p-10 text-center space-y-4 shadow-sm rounded-sm">
            <div className="text-[10px] font-black text-[#004b93] uppercase tracking-[0.3em]">{step}</div>
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{title}</h2>
            <div className="h-px bg-gray-200 w-12 mx-auto" />
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              해당 모듈은 현재 심사 에이전트 연동 대기 중입니다.<br />
              보안 연결이 완료되면 상세 데이터가 활성화됩니다.
            </p>
            <div className="pt-6">
              <div className="inline-block w-8 h-8 border-2 border-[#004b93] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};