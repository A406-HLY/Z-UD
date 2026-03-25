import { Input, Button } from '@/shared/ui';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @page BankSystemPage
 * 초고밀도 단일 페이지 전산 시스템 목업입니다.
 * 모든 심사 지표를 한 화면에서 확인할 수 있도록 배치했습니다.
 */
export const BankSystemPage = () => {
  // 고밀도 테이블 행 컴포넌트 (너비 조절 가능)
  const Field = ({ label, children, width = "w-1/3" }: { label: string; children: React.ReactNode; width?: string }) => (
    <div className={cn("flex border-b border-gray-300", width)}>
      <div className="w-28 bg-[#f1f5f9] px-2 py-1 flex items-center border-r border-gray-300 text-[10px] font-bold text-[#445566] shrink-0">
        {label}
      </div>
      <div className="flex-1 bg-white px-1.5 py-0.5 flex items-center">
        {children}
      </div>
    </div>
  );

  const SectionHeader = ({ title, code }: { title: string; code: string }) => (
    <div className="bg-[#445566] text-white text-[10px] font-bold px-3 py-1 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-1 h-3 bg-blue-400"></div> {title}
      </div>
      <span className="opacity-50 font-mono text-[9px]">{code}</span>
    </div>
  );

  return (
    <div className="h-screen bg-[#f1f5f9] flex flex-col font-sans text-[11px] overflow-hidden">
      {/* Top Header */}
      <header className="h-9 bg-[#003366] text-white flex items-center justify-between px-4 shadow-sm z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
            <span className="text-[#003366] font-black text-[9px]">S</span>
          </div>
          <h1 className="text-[12px] font-bold">SSAFY BANK Integrated Credit Service <span className="mx-2 opacity-30">|</span> 단일 페이지 통합 조회</h1>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-medium text-blue-100">
          <span>영업점: 역삼(012)</span>
          <span>사용자: 홍길동(10293)</span>
          <button className="bg-white/10 px-2 py-0.5 rounded-sm hover:bg-white/20 border border-white/20">LOGOUT</button>
        </div>
      </header>

      {/* Toolbar / Actions */}
      <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex justify-between items-center shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black text-slate-800 uppercase italic">Audit Data Consolidation</h2>
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          <div className="flex gap-4 font-bold text-[#003366] text-[10px]">
            <span>NO: 20260325-001</span>
            <span>STATUS: <span className="text-green-600 underline">READY</span></span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="sm" className="h-6 rounded-none bg-slate-100 border border-slate-300 text-slate-700 font-bold px-3 text-[10px] hover:bg-slate-200">임시저장 (F5)</Button>
          <Button size="sm" className="h-6 rounded-none bg-[#003366] border border-[#002244] text-white font-bold px-4 text-[10px] hover:bg-[#002244]">최종등록 (F10)</Button>
        </div>
      </div>

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 bg-slate-100">
        <div className="max-w-[1200px] mx-auto bg-white border border-gray-300 shadow-lg">
          
          {/* Section 1: Basic & Loan */}
          <SectionHeader title="기본 정보 및 대출 신청 내역" code="SCN-B101" />
          <div className="flex flex-wrap border-l border-gray-300">
            <Field label="상품명" width="w-2/3"><Input id="productName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="성명" width="w-1/3"><Input id="name" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="식별번호" width="w-1/3"><Input id="residentRegistrationNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="전화번호" width="w-1/3"><Input id="phoneNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="목표 대출금" width="w-1/3"><Input id="targetLoanAmount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
            <Field label="대출 목적" width="w-1/3"><Input id="loanPurpose" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="보유주택수" width="w-1/3"><Input id="ownedHouseCount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
            <Field label="근무 유형" width="w-1/3"><Input id="employmentType" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="전입일자" width="w-1/3"><Input id="moveInDate" type="date" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="현주소(차주)" width="w-2/3"><Input id="currentAddress" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
          </div>

          <div className="h-4 bg-slate-50 border-y border-gray-300"></div>

          {/* Section 2: Property */}
          <SectionHeader title="담보물 및 부동산 권리 분석 정보" code="SCN-P202" />
          <div className="flex flex-wrap border-l border-gray-300">
            <Field label="도로명 주소" width="w-1/2"><Input id="propertyAddress" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="지번 주소" width="w-1/2"><Input id="lotAddress" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="건물 종류" width="w-1/3"><Input id="registrationType" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="건물 구조" width="w-1/3"><Input id="buildingType" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="대지권등기" width="w-1/3"><Input id="hasLandRightCause" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="별도등기여부" width="w-1/3"><Input id="hasSeparateRegistration" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="소유권가등기" width="w-1/3"><Input id="hasOwnershipTransferClaim" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="신탁등기여부" width="w-1/3"><Input id="hasTrustRegistration" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="소유자 성명" width="w-1/3"><Input id="ownerName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="채권최고액" width="w-1/3"><Input id="maximumClaimAmount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
            <Field label="위반건축물" width="w-1/3"><Input id="isViolationBuilding" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="주용도" width="w-1/3"><Input id="mainUsage" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="면적(㎡)" width="w-1/3"><Input id="area" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
            <Field label="매매대금" width="w-1/3"><Input id="salePrice" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
            <Field label="층별 상세" width="w-full"><Input id="floorStatus" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="특약사항" width="w-full"><Input id="specialTerms" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="매도인 성명" width="w-1/2"><Input id="sellerName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            <Field label="매수인 성명" width="w-1/2"><Input id="buyerName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
          </div>

          <div className="h-4 bg-slate-50 border-y border-gray-300"></div>

          {/* Section 3: Income & Audit */}
          <div className="flex border-l border-gray-300 overflow-hidden">
            {/* Left: Income */}
            <div className="w-2/3 border-r border-gray-300">
              <SectionHeader title="소득 및 재직 증빙 정보 (Group 001/002)" code="SCN-I303" />
              <div className="flex flex-wrap">
                <div className="w-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 border-b border-gray-200">■ 근로자</div>
                <Field label="가입자구분" width="w-1/2"><Input id="subscriberType" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                <Field label="취득일자" width="w-1/2"><Input id="latestAcquisitionDate" type="date" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                <Field label="상실일자" width="w-1/2"><Input id="latestLossDate" type="date" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                <Field label="근무기간" width="w-1/2"><Input id="workPeriod" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                <Field label="연소득합계" width="w-full"><Input id="annualIncomeTotal" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                
                <div className="w-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 border-t border-b border-gray-200">■ 개인사업자</div>
                <Field label="상호명" width="w-1/2"><Input id="businessName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                <Field label="사업자번호" width="w-1/2"><Input id="businessRegistrationNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                <Field label="귀속년도" width="w-1/2"><Input id="incomeYear" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                <Field label="매출과세표준" width="w-1/2"><Input id="taxableSalesAmount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                <Field label="소득금액" width="w-1/2"><Input id="incomeAmount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                <div className="w-1/2 flex border-b border-gray-300"></div> {/* Spacer to keep 2-column layout consistent if needed */}
                <Field label="소득인정설명" width="w-full"><Input id="incomeAuditDescription" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              </div>
            </div>

            {/* Right: Audit Indicators */}
            <div className="w-1/3">
              <SectionHeader title="심사 지표 관리" code="SCN-A404" />
              <div className="flex flex-col h-full">
                <Field label="담보 시세" width="w-full"><Input id="collateralMarketPrice" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                <Field label="총대출잔액" width="w-full"><Input id="totalLoanBalance" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                <Field label="신용등급" width="w-full"><Input id="creditRating" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-center" /></Field>
                <Field label="연원리금" width="w-full"><Input id="annualPrincipalAndInterestRepayment" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                <div className="flex-1 bg-slate-50 p-4 border-b border-gray-300">
                  <div className="border border-dashed border-gray-400 p-2 text-[9px] text-gray-500 h-full flex flex-col justify-center items-center text-center">
                    <p>심사 완료 시</p>
                    <p className="font-bold text-[#003366]">자동 입력 완료 예정</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-5 bg-slate-800 text-slate-500 flex items-center justify-between px-4 text-[9px] shrink-0 font-mono tracking-tighter">
        <div className="flex gap-4">
          <span>TX: KRW-LENDING-2026</span>
          <span>SEC: ENCRYPTED-LEVEL-4</span>
        </div>
        <div>Copyright © 2026 SSAFY Bank. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default BankSystemPage;
