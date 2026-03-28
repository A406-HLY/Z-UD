import { Input } from '@/shared/ui';
import { useAppSelector } from '@/app/store/hooks';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @page BankSystemPage
 * (Why) 실제 은행의 테미널/전산 환경을 시뮬레이션하여 SSO 연동의 현실감을 높이기 위한 목업 페이지입니다.
 * 초고밀도 단일 페이지 구성을 통해 다양한 심사 지표를 한 화면에 배치했습니다.
 */
export const BankSystemPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  /** 가심사 업무 시스템 실행 (SSO 새 창) */
  const handleOpenLoanSystem = () => {
    // (Why) 실제 은행 환경처럼 별도의 업무 팝업 창을 띄웁니다. 
    // 이때 브라우저의 HttpOnly 쿠키(Refresh Token) 덕분에 새 창에서도 로그인이 유지됩니다.
    const width = 1400;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      '/basic-info', 
      'LoanApplicationSystem', 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  // 사이드바 메뉴 항목
  const menuGroups = [
    {
      title: "통합대출관리",
      items: [
        { label: "대출신청현황", active: false },
        { label: "가심사 진행하기", active: true, onClick: handleOpenLoanSystem },
        { label: "담보물조회", active: false },
      ]
    },
    {
      title: "고객정보관리",
      items: [
        { label: "고객번호생성", active: false },
        { label: "본인인증센터", active: false },
      ]
    },
    {
      title: "전자금융사기",
      items: [
        { label: "입금계좌지정", active: false },
        { label: "사고계좌등록", active: false },
      ]
    }
  ];

  // 고밀도 테이블 행 컴포넌트 (가시성 및 간격 최적화)
  const Field = ({ 
    label, 
    children, 
    unit, 
    width = "w-1/3" 
  }: { 
    label: string; 
    children: React.ReactNode; 
    unit?: string;
    width?: string 
  }) => (
    <div className={cn("flex border-b border-gray-300", width)}>
      <div className="w-28 bg-[#f1f5f9] px-2 py-1 flex items-center border-r border-gray-300 text-[10px] font-bold text-[#445566] shrink-0">
        {label}
      </div>
      {/* (Why) 입격창(white)과 배경(slate-50)의 대비를 주어 가시성을 높이고, 단위가 입력창 바로 뒤에 오도록 배치합니다. */}
      <div className="flex-1 bg-slate-50/50 px-1.5 py-0.5 flex items-center">
        <div className="inline-flex items-center gap-1.5">
          {children}
          {unit && <span className="text-[9px] text-slate-600 font-bold shrink-0">{unit}</span>}
        </div>
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
          <span>영업점: {user?.branchName || '지점 정보 없음'}</span>
          <span>사용자: {user?.name || '---'}({user?.employeeNumber || '---'})</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-48 bg-[#2d3a4b] text-gray-300 flex flex-col shrink-0 border-r border-gray-700">
          <div className="p-3 bg-[#1f2d3d] text-blue-400 font-bold text-[10px] border-b border-gray-800">
             MAIN CONSOLE
          </div>
          <nav className="flex-1 overflow-y-auto">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="mb-2">
                <div className="px-3 py-2 text-[9px] text-gray-500 font-bold uppercase tracking-wider">{group.title}</div>
                {group.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={item.onClick}
                    className={cn(
                      "w-full text-left px-4 py-1.5 text-[10px] border-l-2 transition-colors",
                      item.active 
                        ? "bg-blue-600/20 text-blue-300 border-blue-500 font-bold" 
                        : "border-transparent hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-2 border-t border-gray-700 text-[9px] text-gray-500 text-center">
            SYSTEM v2.0.4 - SECURED
          </div>
        </aside>

        {/* Main Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 bg-slate-100">
          <div className="max-w-[1200px] mx-auto bg-white border border-gray-300 shadow-lg mb-8">
            
            {/* Section 1: Basic & Customer */}
            <SectionHeader title="기본 정보 및 고객 인적 정보" code="SCN-B101" />
            <div className="flex flex-wrap border-l border-gray-300">
              <Field label="상품명" width="w-full"><Input id="productName" placeholder="ex) 싸금자리" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              
              <Field label="성명" width="w-1/4"><Input id="name" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="세대주 성명" width="w-1/4"><Input id="headOfHouseholdName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="주민등록번호" width="w-1/4"><Input id="residentRegistrationNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="식별번호" width="w-1/4"><Input id="identifierNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              
              <Field label="등본등록번호" width="w-1/4"><Input id="registrationNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="발급일자" width="w-1/4"><Input id="issueDate" type="date" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="현주소(차주)" width="w-1/2"><Input id="currentAddress" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>

              <Field label="세대원 목록" width="w-full"><Input id="householdMembers" placeholder="[{name, residentRegistrationNumber}]" className="h-5 rounded-none border-gray-200 text-[10px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              <Field label="전입세대 내역" width="w-full"><Input id="moveInHouseholds" placeholder="['name1', 'name2']" className="h-5 rounded-none border-gray-200 text-[10px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              
              <div className="w-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 border-t border-b border-gray-200 flex items-center">배우자 정보</div>
              <Field label="배우자 유무" width="w-1/3"><Input id="spouse.exists" className="h-5 rounded-none border-gray-200 text-[10px] w-full" placeholder="true/false" /></Field>
              <Field label="배우자 성명" width="w-1/3"><Input id="spouse.name" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="배우자 주민번호" width="w-1/3"><Input id="spouse.residentRegistrationNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            </div>

            <div className="h-4 bg-slate-50 border-y border-gray-300"></div>

            {/* Section 2: Property */}
            <SectionHeader title="담보물 및 부동산 권리 분석 정보" code="SCN-P202" />
            <div className="flex flex-wrap border-l border-gray-300">
              <Field label="대상부동산 주소" width="w-1/2"><Input id="propertyAddress" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="지번 주소" width="w-1/2"><Input id="lotAddress" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="실사 주소" width="w-1/2"><Input id="inspectionAddress" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="동호포함여부" width="w-1/4"><Input id="hasDongho" placeholder="true/false" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="위반건축물" width="w-1/4"><Input id="isViolationBuilding" placeholder="true/false" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              
              <Field label="등기 유형" width="w-1/4"><Input id="registrationType" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="건물 종류" width="w-1/4"><Input id="buildingType" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="주용도" width="w-1/4"><Input id="mainUsage" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="소유자 성명" width="w-1/4"><Input id="ownerName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>

              <Field label="대지권원인여부" width="w-1/3"><Input id="hasLandRightCause" placeholder="true/false" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="소유권이전청구권" width="w-1/3"><Input id="hasOwnershipTransferClaim" placeholder="true/false" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="신탁등기여부" width="w-1/3"><Input id="hasTrustRegistration" placeholder="true/false" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>

              <div className="w-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 border-t border-b border-gray-200 flex items-center">매매 및 권리 내역</div>
              <Field label="매매금액" width="w-1/3" unit="원"><Input id="salePrice" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
              <Field label="매도인 성명" width="w-1/3"><Input id="seller.name" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              <Field label="매수인 성명" width="w-1/3"><Input id="buyer.name" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
              
              <Field label="보증금 목록" width="w-1/2"><Input id="depositAmountList" placeholder="[100000000]" className="h-5 rounded-none border-gray-200 text-[10px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              <Field label="선순위 권리" width="w-1/2"><Input id="seniorRights" placeholder="[{}]" className="h-5 rounded-none border-gray-200 text-[10px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              <Field label="층별 상세현황" width="w-1/2"><Input id="floorStatusList" placeholder="[{floor, usage, area}]" className="h-5 rounded-none border-gray-200 text-[10px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              <Field label="특약사항" width="w-1/2"><Input id="specialTerms" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
            </div>

            <div className="h-4 bg-slate-50 border-y border-gray-300"></div>

            {/* Section 3: Income & Audit */}
            <div className="flex border-l border-gray-300 overflow-hidden flex-col md:flex-row">
              {/* Left: Income */}
              <div className="w-full md:w-2/3 border-r border-gray-300">
                <SectionHeader title="소득 및 직장 증빙 (Group 001/002)" code="SCN-I303" />
                <div className="flex flex-wrap">
                  <Field label="근무 유형" width="w-1/3"><Input id="employmentType" placeholder="EMPLOYEE" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="대출 목적" width="w-1/3"><Input id="loanPurpose" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="보유주택수" width="w-1/3" unit="채"><Input id="ownedHouseCount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>

                  <div className="w-full bg-[#f8fafc] px-2 py-0.5 text-[9px] font-bold text-slate-500 border-y border-gray-200 flex items-center">■ 근로자 세부</div>
                  <Field label="가입자구분" width="w-1/3"><Input id="subscriberType" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="취득일자" width="w-1/3"><Input id="latestAcquisitionDate" type="date" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="상실일자" width="w-1/3"><Input id="latestLossDate" type="date" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="대표자명 유무" width="w-1/3"><Input id="representativeName" placeholder="true/false" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="직인여부" width="w-1/3"><Input id="hasCompanySeal" placeholder="true/false" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="소득자 성명" width="w-1/3"><Input id="incomeRecipientName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="소득자 주민번호" width="w-1/2"><Input id="incomeRecipientResidentRegistrationNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="근무기간" width="w-1/2"><Input id="workPeriod" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="연소득합계" width="w-full" unit="원"><Input id="annualIncomeTotal" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                  
                  <div className="w-full bg-[#f8fafc] px-2 py-0.5 text-[9px] font-bold text-slate-500 border-y border-gray-200 flex items-center">■ 개인사업자 세부</div>
                  <Field label="상호명" width="w-1/2"><Input id="businessName" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="사업자번호" width="w-1/2"><Input id="businessRegistrationNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="법인등록번호" width="w-1/2"><Input id="corporateRegistrationNumber" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="귀속년도" width="w-1/2" unit="년"><Input id="incomeYear" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-center" /></Field>
                  <Field label="결정세액" width="w-1/3" unit="원"><Input id="determinedTaxAmount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                  <Field label="매출과세표준" width="w-1/3" unit="원"><Input id="taxableSalesAmount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                  <Field label="소득금액" width="w-1/3" unit="원"><Input id="incomeAmount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                </div>
              </div>

              {/* Right: Audit Indicators */}
              <div className="w-full md:w-1/3">
                <SectionHeader title="심사 지표 및 세금" code="SCN-A404" />
                <div className="flex flex-col h-full border-b border-gray-300">
                  <Field label="세목(체납) 목록" width="w-full"><Input id="taxItems" placeholder="[{taxItemName, taxAmount, remark}]" className="h-5 rounded-none border-gray-200 text-[10px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
                  <Field label="수기심사요건" width="w-full"><Input id="manualReviewRequired" placeholder="true/false" className="h-5 rounded-none border-gray-200 text-[10px] w-full" /></Field>
                  <Field label="담보 시세" width="w-full" unit="원"><Input id="collateralMarketPrice" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                  <Field label="총대출잔액" width="w-full" unit="원"><Input id="totalRemainingLoanBalance" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                  <Field label="월상환액" width="w-full" unit="원"><Input id="monthlyRepaymentAmount" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                  <Field label="신용등급" width="w-full" unit="등급"><Input id="creditRating" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-center" /></Field>
                  <Field label="연원리금" width="w-full" unit="원"><Input id="annualPrincipalAndInterestRepayment" type="number" className="h-5 rounded-none border-gray-200 text-[10px] w-full text-right" /></Field>
                  
                  <div className="flex-1 bg-slate-50 p-4 min-h-[100px]">
                    <div className="border border-dashed border-gray-400 p-2 text-[9px] text-gray-500 h-full flex flex-col justify-center items-center text-center">
                      <p>SSAFY Core-Banking</p>
                      <p className="font-bold text-[#003366]">RAW JSON SYNC READY</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

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
