import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Header } from '@/widgets/header';
import { LoanTabs } from '@/widgets/loan-tabs';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';
import { AuditReportSection, AuditProgressModal } from '@/widgets/audit-result';
import { 
  useHouseAuditQuery, 
  useMyDataAuditQuery,
  mapHouseAuditToUiModel, 
  mapMyDataToUiModel,
  AuditSummaryItem,
  HouseAuditResponseDto,
  AuditStatus
} from '@/entities/audit';
import { SseAuditStatus, resetAuditState, setAllAuditDone, updateStepStatus, setHouseAuditData, setCreditData, setLoanData } from '@/entities/audit/model/audit.slice';
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

  const { data: houseData, isLoading: isHouseLoading, isSuccess: isHouseSuccess } = useHouseAuditQuery(auditParams);

  // (Why) 주택 심사 정보도 REST 응답이 먼저 올 경우, SSE 이벤트를 기다리지 않고 즉시 완료 상태로 동기화합니다.
  useEffect(() => {
    if (isHouseSuccess && houseData?.data) {
      dispatch(updateStepStatus({ step: 'houseAudit', status: 'SUCCESS', message: '주택 심사 완료 (REST)' }));
      dispatch(setHouseAuditData(houseData.data));
    }
  }, [isHouseSuccess, houseData, dispatch]);

  // (Why) 고객명을 기반으로 마이데이터(신용/대출) 통합 조회를 실행합니다.
  // (Why) 백엔드 SSE 이벤트를 모사하던 기존 방식 대신, 이제 전역 store에서 실시간 상태와 수신 데이터를 가져옵니다.
  const { isAllAuditDone, steps, data } = useAppSelector(state => state.audit);
  const houseDataPayload = data.houseAuditData;

  const customerName = useAppSelector(state => state.customer.data.name);
  const { data: myData, isLoading: isMyDataLoading, isSuccess: isMyDataSuccess } = useMyDataAuditQuery(customerName);

  // (Why) MyData API는 응답이 매우 빠르므로(약 1초), SSE 이벤트를 기다리지 않고 REST 응답 성공 즉시 Redux 상태에 반영합니다.
  useEffect(() => {
    if (isMyDataSuccess && myData) {
      dispatch(updateStepStatus({ step: 'credit', status: 'SUCCESS', message: '신용 정보 조회 완료 (REST)' }));
      dispatch(updateStepStatus({ step: 'loanHistory', status: 'SUCCESS', message: '대출 정보 조회 완료 (REST)' }));
      dispatch(setCreditData(myData));
      dispatch(setLoanData(myData));
    }
  }, [isMyDataSuccess, myData, dispatch]);

  // (Why) 모든 세부 심사항목(신용, 대출, 주택)이 완료된 경우, 최종 REPORT_COMPLETED 이벤트를 기다리지 않고 즉시 완료 처리합니다.
  useEffect(() => {
    const isActuallyDone = 
      steps.credit === 'SUCCESS' && 
      steps.loanHistory === 'SUCCESS' && 
      steps.houseAudit === 'SUCCESS';

    if (isActuallyDone && !isAllAuditDone) {
      dispatch(setAllAuditDone(true));
    }
  }, [steps, isAllAuditDone, dispatch]);

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
    // 1. 주택 심사 데이터 구성
    const effectiveHouseData = houseDataPayload || houseData?.data || mockHouseData?.data;
    const houseItems = effectiveHouseData ? mapHouseAuditToUiModel(effectiveHouseData) : [];
    
    // 2. 마이데이터(신용/대출) 데이터 구성
    // (Why) SSE로 수신된 데이터(data.creditData/loanData)가 있으면 최우선으로 사용하고, 없으면 REST API(myData) 결과를 사용합니다.
    const effectiveMyData = data.creditData || data.loanData || myData;
    const myDataItems = effectiveMyData ? mapMyDataToUiModel(effectiveMyData) : [];

    // (Why) "IDLE(대기)" 상태면 UI에서는 로딩 스켈레톤이나 초기 아이콘을 보여주도록 최하단 단계에서 깔끔하게 LOADING으로 통합합니다.
    // (P1) 피드백 반영: REST API 데이터 유무와 상관없이 실시간 SSE 진행 상태(steps)를 기준으로 상태를 표시합니다.
    const mapStatus = (s: SseAuditStatus, queryLoading: boolean): AuditStatus => 
      (s === 'IDLE' || queryLoading) ? 'LOADING' : s;

    // (Why) 개별 항목의 상태와 요약을 통합 모델로 매핑합니다.
    return [
      ...myDataItems.map(item => ({
        ...item,
        status: mapStatus(
          item.id === 'credit-rating' ? steps.credit : steps.loanHistory, 
          isMyDataLoading
        )
      })),
      ...houseItems.map(item => ({ 
        ...item, 
        status: mapStatus(steps.houseAudit, isHouseLoading) 
      })),
    ];
  }, [houseData, houseDataPayload, mockHouseData, myData, isMyDataLoading, isHouseLoading, steps, data]);

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
