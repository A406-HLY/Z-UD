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
  AuditStatus
} from '@/entities/audit';
import { SseAuditStatus, resetAuditState, setAllAuditDone, updateStepStatus, setHouseAuditData, setCreditData, setLoanData } from '@/entities/audit/model/audit.slice';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { useCallback } from 'react';
import { useCreateReport } from '@/features/verification/api/use-create-report';
import { createReportRequestPayload, aggregateFromDocuments } from '@/entities/verification/model/report-factory';

/**
 * @page customer-info
 * (Why) 데이터의 정보량과 중요도에 따라 최적화된 공간을 할당하는 'B2B 고밀도 실무형 대시보드' 입니디.
 * (P1) 피드백 반영: 신용등급/마이데이터는 상단 지표(Indicator)로 압축하고, 주택/대출은 전체 너비(Full-width)로 확장했습니다.
 */
export const CustomerInfoPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAllAuditDone, steps, data } = useAppSelector(state => state.audit);

  // (Why) OCR 데이터에서 주택 심사에 필요한 소재지 및 건물 유형을 동적으로 추출합니다.
  const ocrValues = useMemo(() => 
    data.ocrData ? aggregateFromDocuments(data.ocrData.documents) : {}, 
  [data.ocrData]);

  const auditParams = useMemo(() => ({
    illegalBuilding: false,
    houseType: (ocrValues.buildingType as string) || '아파트',
    propertyAddress: (ocrValues.propertyAddress as string) || '',
  }), [ocrValues]);

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


  const auditItems = useMemo<AuditSummaryItem[]>(() => {
    // 1. 주택 심사 데이터 구성
    const effectiveHouseData = data.houseAuditData || houseData?.data;
    const houseItems = effectiveHouseData ? mapHouseAuditToUiModel(effectiveHouseData) : [];
    
    // 2. 마이데이터(신용/대출) 데이터 구성
    // (Why) SSE로 수신된 데이터(data.creditData/loanData)가 있으면 최우선으로 사용하고, 없으면 REST API(myData) 결과를 사용합니다.
    const effectiveMyData = data.creditData || data.loanData || myData;
    const myDataItems = effectiveMyData ? mapMyDataToUiModel(effectiveMyData) : [];

    // (Why) "IDLE(대기)" 상태면 UI에서는 로딩 스켈레톤이나 초기 아이콘을 보여주도록 최하단 단계에서 깔끔하게 LOADING으로 통합합니다.
    // (P1) 피드백 반영: REST API 데이터 유무와 상관없이 실시간 SSE 진행 상태(steps)를 기준으로 상태를 표시합니다.
    const mapStatus = (s: SseAuditStatus, queryLoading: boolean): AuditStatus => 
      (s === 'IDLE' || queryLoading) ? 'LOADING' : (s as AuditStatus);

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
  }, [houseData, myData, isMyDataLoading, isHouseLoading, steps, data]);

  // (Why) 모든 조회가 완료되었고, 'ERROR' 상태인 항목이 하나도 없을 때만 다음 단계로 진행 허용
  const canProceed = isAllAuditDone && !auditItems.some(item => item.status === 'ERROR');

  const itemMap = useMemo(() => 
    auditItems.reduce((acc: Record<string, AuditSummaryItem>, item: AuditSummaryItem) => ({ 
      ...acc, 
      [item.id]: item 
    }), {}),
    [auditItems]
  );

  // 1. 리포트 관련 상태 및 훅 추출
  const customerData = useAppSelector(state => state.customer.data);
  const edits = useAppSelector(state => state.verification.edits);
  const { mutate: createReport, isPending: isSubmitting } = useCreateReport();

  /** 
   * 최종 심사 승인 및 리포트 이동 핸들러 
   * (Why) 복잡한 Selector 대신 필요 시점에 직접 Redux 상태를 모아 팩토리 함수를 호출합니다.
   */
  const handleFinalSubmit = useCallback(() => {
    try {
      // (Step 1) 여러 문서에 흩어진 수정 내역 병합
      const allEditsValues: Record<string, any> = {};
      Object.values(edits).forEach(docEdit => {
        Object.assign(allEditsValues, docEdit.values);
      });

      // (Step 2) 최종 페이로드 조립
      // (Note) creditData/loanData는 SSE(data.creditData/loanData)가 없을 경우 REST API(myData) 결과물을 Backup으로 사용합니다.
      const payload = createReportRequestPayload(
        data.ocrData as any,
        allEditsValues,
        customerData,
        data.creditData || myData, // Credit
        data.loanData || myData,   // Loan
        data.houseAuditData || (houseData?.data as any) // House
      );

      // (Step 3) API 호출 및 이동
      createReport(payload, {
        onSuccess: () => navigate('/review-report'),
        onError: (err) => alert(`리포트 생성 실패: ${err.message}`)
      });
    } catch (error) {
      console.error('리포트 조립 중 오류:', error);
      alert('데이터 조립 중 오류가 발생했습니다.');
    }
  }, [data, edits, customerData, myData, createReport, navigate]);

  /** 상단 네비게이션바(LoanTabs) 우측 액션 버튼 정의 */
  const actionButton = useMemo(() => {
    if (!isAllAuditDone) return { label: '심사 중...', onClick: () => {}, disabled: true, className: 'bg-slate-100 text-slate-400' };
    
    // (Why) 심사 부격격 시에는 가심사 종료 단계로 안내합니다.
    if (!canProceed) return { label: '가심사 종료', onClick: () => navigate('/verification-result'), className: 'bg-red-600 text-white' };
    
    // (Why) 전송 중 상태(isSubmitting)를 버튼에 반영합니다.
    return { 
      label: isSubmitting ? '전송 중...' : '심사 시작 (보고서)', 
      onClick: handleFinalSubmit, 
      disabled: isSubmitting,
      className: 'bg-[#004b93] text-white hover:bg-[#003a72]' 
    };
  }, [isAllAuditDone, canProceed, navigate, isSubmitting, handleFinalSubmit]);

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
