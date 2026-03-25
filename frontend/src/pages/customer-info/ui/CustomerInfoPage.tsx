import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';
import { AuditReportSection, AuditProgressModal } from '@/widgets/audit-result';
import { 
  useHouseAuditQuery, 
  mapHouseAuditToUiModel, 
  AuditSummaryItem,
  HouseAuditResponseDto,
  AuditStatus
} from '@/entities/audit';
import { SseAuditStatus, resetAuditState } from '@/entities/audit/model/audit.slice';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';

/**
 * @page customer-info
 * (Why) 데이터의 정보량과 중요도에 따라 최적화된 공간을 할당하는 'B2B 고밀도 실무형 대시보드' 입니디.
 * (P1) 피드백 반영: 신용등급/마이데이터는 상단 지표(Indicator)로 압축하고, 주택/대출은 전체 너비(Full-width)로 확장했습니다.
 */
export const CustomerInfoPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // (Note) 전결거리 토글 테스트를 위한 개발자용 임시 상태 (기본값: 승인 가능하도록 true)
  const [isDevBranchNearest, setIsDevBranchNearest] = useState(true);

  // (Why) 객체 리터럴을 직접 넘기면 매 렌더링마다 참조값이 바뀌어 TanStack Query가 무한 요청을 보낼 수 있으므로 useMemo로 감쌉니다.
  const auditParams = useMemo(() => ({
    illegalBuilding: false,
    houseType: '아파트',
    propertyAddress: '강원특별자치도 원주시 일산동 천사로 130 신진빌리지 6층 601호',
  }), []);

  const { data: houseData } = useHouseAuditQuery(auditParams);

  // (Why) 백엔드 SSE 이벤트를 모사하던 기존 방식 대신, 이제 전역 store에서 실시간 상태와 수신 데이터를 가져옵니다.
  const { isAllAuditDone, steps, data } = useAppSelector(state => state.audit);
  const houseDataPayload = data.houseAuditData;

  // (Why) 백엔드 API 미준비 또는 데이터 부재 시를 위한 주택 심사 기본 모의 데이터
  const mockHouseData = useMemo<HouseAuditResponseDto>(() => ({
    success: true,
    data: {
      housePrice: {
        price: 85000,
        priceType: 'KB 시세 (일반가)',
        message: '담보 가치가 충분하며, 대출 가능 한도 내에 위치합니다.'
      },
      nearestBranch: {
        currentBranchIsNearest: isDevBranchNearest, 
        currentBranchName: '강남지점',
        currentBranchAddress: '테헤란로',
        currentBranchDistanceMeter: isDevBranchNearest ? 1200 : 5500,
        nearestBranchName: '강남지점',
        nearestBranchAddress: '테헤란로',
        nearestBranchDistanceMeter: 1200,
        message: isDevBranchNearest ? '관할 지점 내 물건지입니다.' : '관할 지점 범위를 벗어난 물건지입니다.'
      },
      illegalBuilding: false,
      supportedHouseType: true
    }
  }), [isDevBranchNearest]);

  const auditItems = useMemo<AuditSummaryItem[]>(() => {
    // 수신된 실제 데이터가 우선이며, 서버 통신이 실패하거나 도달하지 않은 경우 목업/임시 데이터를 표시합니다.
    const effectiveHouseData = houseDataPayload || houseData || mockHouseData;
    const houseItems = effectiveHouseData ? mapHouseAuditToUiModel(effectiveHouseData) : [];
    
    // (P2) SSE가 완료(SUCCESS) 된 경우 실제 데이터 값을 요약문으로 노출
    const creditSummary = steps.credit === 'SUCCESS' && data.creditData ? data.creditData.summary || 'A (최우수)' : '조회 중...';
    const loanSummary = steps.loanHistory === 'SUCCESS' && data.loanData ? data.loanData.summary || '3건의 부채 확인' : '조회 중...';

    // (Why) "IDLE(대기)" 상태면 UI에서는 로딩 스켈레톤이나 초기 아이콘을 보여주도록 최하단 단계에서 깔끔하게 LOADING으로 통합합니다.
    const mapStatus = (s: SseAuditStatus): AuditStatus => s === 'IDLE' ? 'LOADING' : s;

    return [
      { id: 'credit-rating', title: '신용등급 조회', summary: creditSummary, status: mapStatus(steps.credit) },
      { id: 'loan-history', title: '기존 대출 내역', summary: loanSummary, status: mapStatus(steps.loanHistory) },
      ...houseItems.map(item => ({ ...item, status: mapStatus(steps.houseAudit) })),
    ];
  }, [houseData, houseDataPayload, mockHouseData, steps, data]);

  // (Why) 모든 조회가 완료되었고, 'ERROR' 상태인 항목이 하나도 없을 때만 다음 단계로 진행 허용
  const canProceed = isAllAuditDone && !auditItems.some(item => item.status === 'ERROR');

  const itemMap = useMemo(() => 
    auditItems.reduce((acc: Record<string, AuditSummaryItem>, item: AuditSummaryItem) => ({ 
      ...acc, 
      [item.id]: item 
    }), {}),
    [auditItems]
  );

  /** 상단 네비게이션바(LoanTabs) 우측 액션 버튼 정의 */
  const actionButton = useMemo(() => {
    if (!isAllAuditDone) return { label: '심사 중...', onClick: () => {}, disabled: true, className: 'bg-slate-100 text-slate-400' };
    if (!canProceed) return { label: '가심사 종료', onClick: () => navigate('/verification-result'), className: 'bg-red-600 text-white' };
    return { label: '심사 시작 (보고서)', onClick: () => navigate('/review-report'), className: 'bg-[#004b93] text-white' };
  }, [isAllAuditDone, canProceed, navigate]);

  return (
    <div className="min-h-screen bg-[#f1f3f5] flex flex-col font-sans pb-10">
      <Header />
      
      {/* 다시 심사 결과 페이지 내부로 모달을 이동시켰습니다. */}
      <AuditProgressModal isOpen={!isAllAuditDone} />

      <main className="flex-1 p-4 space-y-4">
        {/* 상단 진행 상태 */}
        <section>
          <LoanStepper />
        </section>
        
        {/* 상단 고객 정보 & 네비게이션 */}
        <section><CustomerInfoForm /></section>
        <section><LoanTabs actionButton={actionButton} /></section>

        {/* 종합 심사 현황 데이터 (High-Density) */}
        <div className="space-y-4 pt-2">
          
          {/* 심사 불가 항목 발견 시 노출되는 배너 */}
          {!canProceed && isAllAuditDone && (
             <div className="p-3 bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 text-[12px] shadow-sm animate-in fade-in duration-300">
                <div className="mt-0.5">🛑</div>
                <div>
                  <p className="font-bold">심사 부적격 항목 감별됨</p>
                  <p className="mt-0.5 text-[11px] opacity-90">
                    당행 취급 기준 미달 물건지가 감별되었습니다. 해당 건의 가심사 프로세스를 종료합니다. (사유: 관할 지점 전결 거리 초과)
                  </p>
                </div>
             </div>
          )}

          {/* 1. 신용등급 조회 (High-Density Board) */}
          <AuditReportSection 
            item={itemMap['credit-rating'] || { id: 'credit-rating', title: '신용등급 조회', status: 'LOADING', summary: '' }} 
          />

          {/* 2. 주택 담보물 심사 (핵심 분석) */}
          <AuditReportSection 
            item={itemMap['house-audit'] || { id: 'house-audit', title: '주택 담보물 심사', status: 'LOADING', summary: '' }} 
          />

          {/* 3. 기존 대출 내역 (상세 테이블) */}
          <AuditReportSection 
            item={itemMap['loan-history'] || { id: 'loan-history', title: '기존 대출 내역', status: 'LOADING', summary: '' }} 
          />
        </div>

        {/* --- [DEV] 하단 테스트용 토글 버튼 --- */}
         <div className="mt-8 flex justify-center gap-3">
            <button 
              onClick={() => setIsDevBranchNearest(!isDevBranchNearest)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded text-[11px] hover:bg-slate-700 transition-colors opacity-40 hover:opacity-100"
            >
              <Settings size={12} />
              <span>[DEV] 전결거리 토글 (현재: {isDevBranchNearest ? '승인 가능' : '취급 불가'})</span>
            </button>
            <button 
              onClick={() => dispatch(resetAuditState())}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-800 text-white rounded text-[11px] hover:bg-red-700 transition-colors opacity-40 hover:opacity-100"
            >
              <span>[DEV] 스토어 초기화 (데이터 비우기)</span>
            </button>
         </div>
      </main>
    </div>
  );
};

export default CustomerInfoPage;
