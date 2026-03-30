import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { SseAuditStatus, setAllAuditDone, updateStepStatus, setHouseAuditData, setCreditData, setLoanData } from '@/entities/audit/model/audit.slice';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { useCallback } from 'react';
import { useCreateReport } from '@/features/verification/api/use-create-report';
import { createReportRequestPayload, aggregateFromDocuments } from '@/entities/verification/model/report-factory';

export const CustomerInfoPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAllAuditDone, steps, data } = useAppSelector(state => state.audit);

  const ocrValues = useMemo(() =>
    data.ocrData ? aggregateFromDocuments(data.ocrData.documents) : {},
  [data.ocrData]);

  const auditParams = useMemo(() => ({
    illegalBuilding: false,
    houseType: (ocrValues.buildingType as string) || '아파트',
    propertyAddress: (ocrValues.lotAddress as string) || (ocrValues.propertyAddress as string) || '',
  }), [ocrValues]);

  const { data: houseData, isLoading: isHouseLoading, isSuccess: isHouseSuccess } = useHouseAuditQuery(auditParams);

  useEffect(() => {
    if (isHouseSuccess && houseData?.data) {
      dispatch(updateStepStatus({ step: 'houseAudit', status: 'SUCCESS', message: '주택 심사 완료 (REST)' }));
      dispatch(setHouseAuditData(houseData.data));
    }
  }, [isHouseSuccess, houseData, dispatch]);

  const customerName = useAppSelector(state => state.customer.data.name);
  const { data: myData, isLoading: isMyDataLoading, isSuccess: isMyDataSuccess } = useMyDataAuditQuery(customerName);

  useEffect(() => {
    if (isMyDataSuccess && myData) {
      dispatch(updateStepStatus({ step: 'credit', status: 'SUCCESS', message: '신용 정보 조회 완료 (REST)' }));
      dispatch(updateStepStatus({ step: 'loanHistory', status: 'SUCCESS', message: '대출 정보 조회 완료 (REST)' }));
      dispatch(setCreditData(myData));
      dispatch(setLoanData(myData));
    }
  }, [isMyDataSuccess, myData, dispatch]);

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
    const effectiveHouseData = data.houseAuditData || houseData?.data;
    const houseItems = effectiveHouseData ? mapHouseAuditToUiModel(effectiveHouseData) : [];

    const effectiveMyData = data.creditData || data.loanData || myData;
    const myDataItems = effectiveMyData ? mapMyDataToUiModel(effectiveMyData) : [];

    const mapStatus = (s: SseAuditStatus, queryLoading: boolean): AuditStatus =>
      (s === 'IDLE' || queryLoading) ? 'LOADING' : (s as AuditStatus);

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

  const canProceed = isAllAuditDone && !auditItems.some(item => item.status === 'ERROR');

  const itemMap = useMemo(() =>
    auditItems.reduce((acc: Record<string, AuditSummaryItem>, item: AuditSummaryItem) => ({
      ...acc,
      [item.id]: item
    }), {}),
    [auditItems]
  );

  const customerData = useAppSelector(state => state.customer.data);
  const edits = useAppSelector(state => state.verification.edits);
  const { mutate: createReport, isPending: isSubmitting } = useCreateReport();

  const handleFinalSubmit = useCallback(() => {
    try {
      const allEditsValues: Record<string, any> = {};
      Object.values(edits).forEach(docEdit => {
        Object.assign(allEditsValues, docEdit.values);
      });

      const payload = createReportRequestPayload(
        data.ocrData as any,
        allEditsValues,
        customerData,
        data.creditData || myData,
        data.loanData || myData,
        data.houseAuditData || (houseData?.data as any)
      );

      createReport(payload, {
        onSuccess: () => navigate('/review-report'),
        onError: (err) => alert(`리포트 생성 실패: ${err.message}`)
      });
    } catch (error) {

      alert('데이터 조립 중 오류가 발생했습니다.');
    }
  }, [data, edits, customerData, myData, houseData, createReport, navigate]);

  const actionButton = useMemo(() => {
    if (!isAllAuditDone) return { label: '심사 중...', onClick: () => {}, disabled: true, className: 'bg-slate-100 text-slate-400' };

    if (!canProceed) return { label: '가심사 종료', onClick: () => navigate('/verification-result'), className: 'bg-red-600 text-white' };

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

      <AuditProgressModal isOpen={!isAllAuditDone} />

      <main className="flex-1 p-4 space-y-4">
        <section>
          <LoanStepper />
        </section>

        <section><CustomerInfoForm /></section>
        <section><LoanTabs actionButton={actionButton} /></section>

        <div className="space-y-4 pt-2">

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

          <AuditReportSection
            item={itemMap['credit-rating'] || { id: 'credit-rating', title: '신용등급 조회', status: 'LOADING', summary: '' }}
          />

          <AuditReportSection
            item={itemMap['house-audit'] || { id: 'house-audit', title: '주택 담보물 심사', status: 'LOADING', summary: '' }}
          />

          <AuditReportSection
            item={itemMap['loan-history'] || { id: 'loan-history', title: '기존 대출 내역', status: 'LOADING', summary: '' }}
          />
        </div>
      </main>
    </div>
  );
};

export default CustomerInfoPage;