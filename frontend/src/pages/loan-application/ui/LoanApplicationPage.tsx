import { Header } from '@/widgets/header/ui/Header';
import { CustomerInfoForm } from '@/widgets/customer-info-form/ui/CustomerInfoForm';

/**
 * 대출 신청 메인 페이지 (기초 정보 입력 단계)
 * - Header와 CustomerInfoForm 위젯을 조립함
 * - FSD의 Pages 레이어는 데이터 흐름의 시작점 역할을 수행함
 */
export const LoanApplicationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 고정 헤더 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 p-6 space-y-6">
        <section>
          <CustomerInfoForm />
        </section>

        {/* 탭 및 테이블 영역 (추후 구현 예정) */}
        <section className="bg-white border border-gray-200 h-96 flex items-center justify-center text-gray-400">
          탭 및 상세 목록 영역 (준비 중...)
        </section>
      </main>
    </div>
  );
};

export default LoanApplicationPage;
