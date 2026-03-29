import { useState, useEffect } from 'react';
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
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // (Front-only 시뮬레이션용) 이관된 데이터를 수신하여 보관할 상태
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transferData, setTransferData] = useState<any>(null);

  useEffect(() => {
    const channel = new BroadcastChannel('bank-system-transfer');
    channel.onmessage = (event) => {
      console.log('[BankSystem] 이관 데이터 수신:', event.data);
      setTransferData(event.data);
    };
    return () => channel.close();
  }, []);

  /**
   * (Why) transferData가 null(이관 전)일 때는 value/readOnly를 주입하지 않아
   * 기존의 placeholder + 편집 가능 상태를 그대로 유지합니다.
   * 이관 완료 후에만 데이터를 바인딩하고 readOnly로 잠급니다.
   */
  const v = (val: string | number | undefined | null) =>
    transferData ? { value: String(val ?? ''), readOnly: true } : {};

  // (Why) 이미 report-factory에서 매핑된 홍보용 데이터를 그대로 사용하므로 vBool/vJson은 v로 대체 가능합니다.
  const vBool = v;
  const vJson = v;

  /** 가심사 업무 시스템 실행 (SSO 새 창) */
  const handleOpenLoanSystem = () => {
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
        { label: "담보물조회", active: false },
        { label: "심사 진행하기", active: true },
        { label: "가심사 진행하기", active: false, onClick: handleOpenLoanSystem },
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

  // 고밀도 테이블 행 컴포넌트
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
      <div className="w-28 bg-[#f1f5f9] px-2 py-1 flex items-center border-r border-gray-300 text-[11px] font-bold text-[#445566] shrink-0">
        {label}
      </div>
      <div className="flex-1 bg-slate-50/50 px-1.5 py-0.5 flex items-center">
        <div className="inline-flex items-center gap-1.5">
          {children}
          {unit && <span className="text-[9px] text-slate-600 font-bold shrink-0">{unit}</span>}
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, code }: { title: string; code: string }) => (
    <div className="bg-[#445566] text-white text-[11px] font-bold px-3 py-1 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-1 h-3 bg-blue-400"></div> {title}
      </div>
      <span className="opacity-50 font-mono text-[9px]">{code}</span>
    </div>
  );

  // (Why) 단일 페이지 통합 조회를 위한 초고밀도 UI이므로 Input 컴포넌트의 기본 최소 높이 및 패딩을 무효화합니다.
  const denseInputStyle = "[&_input]:!min-h-0 [&_input]:!p-0 [&_input]:!px-1";
  // (Why) 이관 데이터가 수신됐을 때만 입력 필드 텍스트를 파란색 강조 처리 및 흰색 배경화
  const dataStyle = transferData ? '[&_input]:text-[#004b93]! [&_input]:font-bold! [&_input]:bg-white!' : '';

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
        <div className="flex items-center gap-4 text-[9px] font-medium text-blue-100 ml-auto">
          <span>영업점: {user?.branchName || '지점 정보 없음'}</span>
          <span>사용자: {user?.name || '---'}({user?.employeeNumber || '---'})</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-48 bg-[#2d3a4b] text-gray-300 flex flex-col shrink-0 border-r border-gray-700">
          <div className="p-3 bg-[#1f2d3d] text-blue-400 font-bold text-[11px] border-b border-gray-800">
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
                      "w-full text-left px-4 py-1.5 text-[11px] border-l-2 transition-colors",
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
          <div className="w-full bg-white border border-gray-300 shadow-lg mb-8">
            
            {/* Page Action Bar */}
            <div className="bg-slate-50 border-b border-gray-300 px-4 py-2 flex items-center justify-between sticky top-0 z-20 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-slate-700">심사 진행하기</span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 border border-slate-200 rounded">TASK-ID: 2026-XP001</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSavedModalOpen(true)}
                  className={cn(
                    "h-7 px-4 bg-[#e2e8f0] text-[#1e293b] text-[11px] font-bold border-2",
                    "border-t-white border-l-white border-b-[#94a3b8] border-r-[#94a3b8]",
                    "active:border-t-[#94a3b8] active:border-l-[#94a3b8] active:border-b-white active:border-r-white",
                    "flex items-center gap-1.5 shadow-[inset_1px_1px_0px_white] transition-colors hover:bg-[#cbd5e1]"
                  )}
                >
                  💾 임시저장(S)
                </button>
                <button 
                  className={cn(
                    "h-7 px-4 bg-[#003366] text-white text-[11px] font-bold border-2",
                    "border-t-[#1e3a8a] border-l-[#1e3a8a] border-b-[#001122] border-r-[#001122]",
                    "active:border-t-[#001122] active:border-l-[#001122] active:border-b-[#1e3a8a] active:border-r-[#1e3a8a]",
                    "flex items-center gap-1.5 shadow-[inset_1px_1px_0px_#1e40af] transition-colors hover:bg-[#002244]"
                  )}
                >
                  ⚡ 심사 진행(E)
                </button>
              </div>
            </div>

            {/* Legacy Popup Modal */}
            {isSavedModalOpen && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <div className="w-[340px] bg-[#f1f5f9] border-2 border-t-white border-l-white border-b-[#475569] border-r-[#475569] shadow-2xl p-1">
                  {/* Modal Title Bar */}
                  <div className="bg-[#445566] text-white px-2 py-1.5 flex justify-between items-center select-none">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-400"></div>
                      <span className="text-[11px] font-bold tracking-tight">SSAFY BANK Integrated Service - 알림</span>
                    </div>
                    <button 
                      onClick={() => setIsSavedModalOpen(false)}
                      className="w-4 h-4 bg-transparent text-white/70 hover:text-white text-[14px] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  {/* Modal Content */}
                  <div className="p-5 flex flex-col items-center gap-5 bg-white m-0.5 border border-gray-300">
                    <div className="flex items-start gap-4 w-full">
                      <div className="w-10 h-10 shrink-0 bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl rounded-full">!</div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[12px] font-bold text-[#1e293b] leading-tight">[전산시스템 안내]</p>
                        <p className="text-[11px] font-medium text-slate-600 leading-normal">
                          해당 심사 정보가 정상적으로 <br />
                          파일 저장소에 <span className="text-blue-700 font-bold">임시저장</span> 되었습니다.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsSavedModalOpen(false)}
                      className={cn(
                        "min-w-[80px] h-7 bg-[#445566] text-white text-[11px] font-bold border-2",
                        "border-t-[#64748b] border-l-[#64748b] border-b-[#1e293b] border-r-[#1e293b]",
                        "active:border-t-[#1e293b] active:border-l-[#1e293b] active:border-b-[#64748b] active:border-r-[#64748b]",
                        "shadow-[inset_1px_1px_0px_#94a3b8] hover:bg-[#334455] transition-colors"
                      )}
                    >
                      확인(O)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: Basic & Customer */}
            <SectionHeader title="기본 정보 및 고객 인적 정보" code="SCN-B101" />
            <div className={cn("flex flex-wrap border-l border-gray-300", denseInputStyle, dataStyle)}>
              <Field label="상품명" width="w-full"><Input id="productName" {...v(transferData?.reportInput?.productName)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              
              <Field label="성명" width="w-1/4"><Input id="name" {...v(transferData?.reportInput?.name)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="세대주 성명" width="w-1/4"><Input id="headOfHouseholdName" {...v(transferData?.reportInput?.headOfHouseholdName)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="주민등록번호" width="w-1/4"><Input id="residentRegistrationNumber" {...v(transferData?.reportInput?.residentRegistrationNumber)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="식별번호" width="w-1/4"><Input id="identifierNumber" {...v(transferData?.reportInput?.identifierNumber)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              
              <Field label="등기/등본 등 번호" width="w-1/4"><Input id="registrationNumber" {...v(transferData?.reportInput?.registrationType)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="발급일자" width="w-1/4"><Input id="issueDate" type="date" {...v(transferData?.reportInput?.issueDate)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="현주소(차주)" width="w-1/2"><Input id="currentAddress" {...v(transferData?.reportInput?.currentAddress)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>

              <Field label="세대원 목록" width="w-full"><Input id="householdMembers" {...vJson(transferData?.reportInput?.householdMembers)} className="h-5 rounded-none border-gray-200 text-[11px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              <Field label="전입세대 내역" width="w-full"><Input id="moveInHouseholds" {...vJson(transferData?.reportInput?.moveInHouseholds)} className="h-5 rounded-none border-gray-200 text-[11px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              
              <div className="w-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 border-t border-b border-gray-200 flex items-center">배우자 정보</div>
              <Field label="배우자 유무" width="w-1/3"><Input id="spouse.exists" {...vBool(transferData?.reportInput?.spouse?.exists)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="배우자 성명" width="w-1/3"><Input id="spouse.name" {...v(transferData?.reportInput?.spouse?.name)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="배우자 주민번호" width="w-1/3"><Input id="spouse.residentRegistrationNumber" {...v(transferData?.reportInput?.spouse?.residentRegistrationNumber)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
            </div>

            <div className="h-4 bg-slate-50 border-y border-gray-300"></div>

            {/* Section 2: Property */}
            <SectionHeader title="담보물 및 부동산 권리 분석 정보" code="SCN-P202" />
            <div className={cn("flex flex-wrap border-l border-gray-300", denseInputStyle, dataStyle)}>
              <Field label="대상부동산 주소" width="w-1/2"><Input id="propertyAddress" {...v(transferData?.reportInput?.propertyAddress)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="지번 주소" width="w-1/2"><Input id="lotAddress" {...v(transferData?.reportInput?.lotAddress)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="실사 주소" width="w-1/2"><Input id="inspectionAddress" {...v(transferData?.reportInput?.inspectionAddress)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="동호포함여부" width="w-1/4"><Input id="hasDongho" {...vBool(transferData?.reportInput?.hasDongho)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="위반건축물" width="w-1/4"><Input id="isViolationBuilding" {...vBool(transferData?.reportInput?.isViolationBuilding)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              
              <Field label="등기 유형" width="w-1/4"><Input id="registrationType" {...v(transferData?.reportInput?.registrationType)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="건물 종류" width="w-1/4"><Input id="buildingType" {...v(transferData?.reportInput?.buildingType)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="주용도" width="w-1/4"><Input id="mainUsage" {...v(transferData?.reportInput?.mainUsage)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="소유자 성명" width="w-1/4"><Input id="ownerName" {...v(transferData?.reportInput?.ownerName)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>

              <Field label="대지권원인여부" width="w-1/3"><Input id="hasLandRightCause" {...vBool(transferData?.reportInput?.hasLandRightCause)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="소유권이전청구권" width="w-1/3"><Input id="hasOwnershipTransferClaim" {...vBool(transferData?.reportInput?.hasOwnershipTransferClaim)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="신탁등기여부" width="w-1/3"><Input id="hasTrustRegistration" {...vBool(transferData?.reportInput?.hasTrustRegistration)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>

              <div className="w-full bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500 border-t border-b border-gray-200 flex items-center">매매 및 권리 내역</div>
              <Field label="매매금액" width="w-1/3" unit="원"><Input id="salePrice" {...v(transferData?.reportInput?.salePrice)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
              <Field label="매도인 성명" width="w-1/3"><Input id="seller.name" {...v(transferData?.reportInput?.seller?.name)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              <Field label="매수인 성명" width="w-1/3"><Input id="buyer.name" {...v(transferData?.reportInput?.buyer?.name)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
              
              <Field label="보증금 목록" width="w-1/2"><Input id="depositAmountList" {...vJson(transferData?.reportInput?.depositAmountList)} className="h-5 rounded-none border-gray-200 text-[11px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              <Field label="선순위 권리" width="w-1/2"><Input id="seniorRights" {...vJson(transferData?.reportInput?.seniorRights)} className="h-5 rounded-none border-gray-200 text-[11px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              <Field label="층별 상세현황" width="w-1/2"><Input id="floorStatusList" {...vJson(transferData?.reportInput?.floorStatusList)} className="h-5 rounded-none border-gray-200 text-[11px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
              <Field label="특약사항" width="w-1/2"><Input id="specialTerms" {...v(transferData?.reportInput?.specialTerms)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
            </div>

            <div className="h-4 bg-slate-50 border-y border-gray-300"></div>

            {/* Section 3: Income & Audit */}
            <div className={cn("flex border-l border-gray-300 overflow-hidden flex-col md:flex-row", denseInputStyle, dataStyle)}>
              {/* Left: Income */}
              <div className="w-full md:w-2/3 border-r border-gray-300">
                <SectionHeader title="소득 및 직장 증빙 (Group 001/002)" code="SCN-I303" />
                <div className="flex flex-wrap">
                  <Field label="근무 유형" width="w-1/3"><Input id="employmentType" {...v(transferData?.reportInput?.employmentType)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="대출 목적" width="w-1/3"><Input id="loanPurpose" {...v(transferData?.reportInput?.loanPurpose)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="보유주택수" width="w-1/3" unit="채"><Input id="ownedHouseCount" {...v(transferData?.reportInput?.ownedHouseCount)} type="number" className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>

                  <div className="w-full bg-[#f8fafc] px-2 py-0.5 text-[9px] font-bold text-slate-500 border-y border-gray-200 flex items-center">■ 근로자 세부</div>
                  <Field label="가입자구분" width="w-1/3"><Input id="subscriberType" {...v(transferData?.reportInput?.subscriberType)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="취득일자" width="w-1/3"><Input id="latestAcquisitionDate" type="date" {...v(transferData?.reportInput?.latestAcquisitionDate)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="상실일자" width="w-1/3"><Input id="latestLossDate" type="date" {...v(transferData?.reportInput?.latestLossDate)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="대표자명 유무" width="w-1/3"><Input id="representativeName" {...vBool(transferData?.reportInput?.representativeName)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="직인여부" width="w-1/3"><Input id="hasCompanySeal" {...vBool(transferData?.reportInput?.hasCompanySeal)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="소득자 성명" width="w-1/3"><Input id="incomeRecipientName" {...v(transferData?.reportInput?.incomeRecipientName)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="소득자 주민번호" width="w-1/2"><Input id="incomeRecipientResidentRegistrationNumber" {...v(transferData?.reportInput?.incomeRecipientResidentRegistrationNumber)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="근무기간" width="w-1/2"><Input id="workPeriod" {...v(transferData?.reportInput?.workPeriod)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="연소득합계" width="w-full" unit="원"><Input id="annualIncomeTotal" {...v(transferData?.reportInput?.annualIncomeTotal)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
                  
                  <div className="w-full bg-[#f8fafc] px-2 py-0.5 text-[9px] font-bold text-slate-500 border-y border-gray-200 flex items-center">■ 개인사업자 세부</div>
                  <Field label="상호명" width="w-1/2"><Input id="businessName" {...v(transferData?.reportInput?.businessName)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="사업자번호" width="w-1/2"><Input id="businessRegistrationNumber" {...v(transferData?.reportInput?.businessRegistrationNumber)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="법인등록번호" width="w-1/2"><Input id="corporateRegistrationNumber" {...v(transferData?.reportInput?.corporateRegistrationNumber)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="귀속년도" width="w-1/2" unit="년"><Input id="incomeYear" {...v(transferData?.reportInput?.incomeYear)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-center" /></Field>
                  <Field label="결정세액" width="w-1/3" unit="원"><Input id="determinedTaxAmount" {...v(transferData?.reportInput?.determinedTaxAmount)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
                  <Field label="매출과세표준" width="w-1/3" unit="원"><Input id="taxableSalesAmount" {...v(transferData?.reportInput?.taxableSalesAmount)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
                  <Field label="소득금액" width="w-1/3" unit="원"><Input id="incomeAmount" {...v(transferData?.reportInput?.incomeAmount)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
                </div>
              </div>

              {/* Right: Audit Indicators */}
              <div className="w-full md:w-1/3">
                <SectionHeader title="심사 지표 및 세금" code="SCN-A404" />
                <div className="flex flex-col h-full border-b border-gray-300">
                  <Field label="세목(체납) 목록" width="w-full"><Input id="taxItems" {...vJson(transferData?.reportInput?.taxItems)} className="h-5 rounded-none border-gray-200 text-[11px] w-full font-mono text-blue-600 bg-slate-50" /></Field>
                  <Field label="수기심사요건" width="w-full"><Input id="manualReviewRequired" {...vBool(transferData?.reportInput?.manualReviewRequired)} className="h-5 rounded-none border-gray-200 text-[11px] w-full" /></Field>
                  <Field label="담보 시세" width="w-full" unit="원"><Input id="collateralMarketPrice" {...v(transferData?.reportInput?.collateralMarketPrice)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
                  <Field label="총대출잔액" width="w-full" unit="원"><Input id="totalRemainingLoanBalance" type="number" {...v(transferData?.reportInput?.totalRemainingLoanBalance)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
                  <Field label="월상환액" width="w-full" unit="원"><Input id="monthlyRepaymentAmount" type="number" {...v(transferData?.reportInput?.monthlyRepaymentAmount)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
                  <Field label="신용등급" width="w-full" unit="등급"><Input id="creditRating" {...v(transferData?.reportInput?.creditRating)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-center" /></Field>
                  <Field label="연원리금" width="w-full" unit="원"><Input id="annualPrincipalAndInterestRepayment" type="number" {...v(transferData?.reportInput?.annualPrincipalAndInterestRepayment)} className="h-5 rounded-none border-gray-200 text-[11px] w-full text-right" /></Field>
                  
                  <div className="flex-1 bg-slate-50 p-4 min-h-[100px]">
                    <div className={cn("border p-2 text-[9px] h-full flex flex-col justify-center items-center text-center", transferData ? "border-solid border-[#004b93] text-[#004b93] bg-[#004b93]/5" : "border-dashed border-gray-400 text-gray-500")}>
                      <p>SSAFY Core-Banking</p>
                      <p className={cn("font-bold", transferData ? "text-blue-600 text-[11px]" : "text-[#003366]")}>
                        {transferData ? "✅ DATA RECEPTION COMPLETED" : "RAW JSON SYNC READY"}
                      </p>
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
