import { useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Header } from '@/widgets/header';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';

import { ProductTabs, StatusSummaryBoard, LimitVisualizationCard } from '@/widgets/review-summary';
import { ReviewDetailsList } from '@/widgets/review-details';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';
import { useReviewReportController } from '@/features/review/model/use-review-report-controller';
import { 
  createReportRequestPayload, 
  createLegacyTransferPayload,
  mapReportToBankSystemFormat 
} from '@/entities/verification/model/report-factory';
import { MOCK_PDF_FILES } from '@/shared/config/pdfConfig';
import { ReportProgressModal } from '@/widgets/review-summary/ui/ReportProgressModal';

import { Loader2, AlertTriangle } from 'lucide-react';
import { LoanTabs } from '@/widgets/loan-tabs';
import { transferConsultationToLegacy } from '@/entities/customer/api/customer.api';

/**
 * @page review-report
 * 심사레포트 단계 최상위 화면 (데이터 연동 및 Split 뷰 스켈레톤)
 */
export const ReviewReportPage = () => {
  // 0. Redux 상태 구독 (지연 조립을 위한 원천 데이터)
  const customerData = useSelector((state: RootState) => state.customer.data);
  const { ocrData, creditData, loanData } = useSelector((state: RootState) => state.audit.data);
  const edits = useSelector((state: RootState) => state.verification.edits);
  const reviewData = useSelector((state: RootState) => state.review.data);
  const isAllAuditDone = useSelector((state: RootState) => state.audit.isAllAuditDone);

  const consultationId = customerData.consultationId || "CONS-2026-TEMP-001";
  const { 
    isLoading, 
    isError, 
    error, 
    pdfPage, 
    setPdfPage, 
    pdfScale, 
    setPdfScale,
    guidelineUrl // (New) 컨트롤러에서 가져온 동적 URL
  } = useReviewReportController(consultationId);

  // 1. API 상태 추가
  const [isTransferring, setIsTransferring] = useState(false);

  // 1. Split View 조절 로직
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(55);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const newWidth = ((moveEvent.clientX - left) / width) * 100;
      // 너무 작아지거나 커지지 않게 제한 (최소 30%, 최대 70%)
      if (newWidth > 30 && newWidth < 70) {
        setLeftWidthPercent(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // 3. 최종 데이터 조립 및 이관 핸들러 (Transfer)
  const handleFinalSubmit = useCallback(async () => {
    if (!consultationId || consultationId.includes("TEMP")) {
      alert("유효한 상담 ID가 존재하지 않습니다.");
      return;
    }

    try {
      setIsTransferring(true);
      // (Why) 여러 문서에 흩어진 수정 내역을 하나의 평탄화된 객체로 병합합니다.
      const allEditsValues: Record<string, any> = {};
      Object.values(edits).forEach(docEdit => {
        Object.assign(allEditsValues, docEdit.values);
      });

      // 1. 기존 페이로드 뼈대 조립
      const basePayload = createReportRequestPayload(
        ocrData as any,
        allEditsValues,
        customerData as any,
        creditData,
        loanData
      );

      // 2. 레거시(은행망) 전산망 이관 페이로드 생성
      const transferPayload = createLegacyTransferPayload(
        basePayload.reportInput, 
        customerData as any, 
        "싸금자리"
      );

      console.log('🚀 [Transfer] 최종 이관 페이로드:', transferPayload);
      
      // 3. 실제 전산 이관 API 호출 (원본 타입 유지 페이로드)
      await transferConsultationToLegacy(consultationId, transferPayload);
      
      // 4. (프론트 단독 시뮬레이션용) 부모 창(BankSystem)으로 가독성 있게 가공된 데이터 발송
      const uiPayload = mapReportToBankSystemFormat(transferPayload);
      const channel = new BroadcastChannel('bank-system-transfer');
      channel.postMessage(uiPayload);
      channel.close();
      
      alert('✅ 통합 전산망으로 최종 심사 결과가 성공적으로 전송(이관)되었습니다!');
      
    } catch (err: any) {
      console.error('❌ 데이터 조립 및 이관 중 오류 발생:', err);
      alert(`전송 실패: ${err?.response?.data?.message || err.message}`);
    } finally {
      setIsTransferring(false);
    }
  }, [ocrData, customerData, creditData, loanData, edits, consultationId]);

  // 4. 전산 액션 버튼 정의
  const approvalButton = {
    label: isTransferring ? '전송 중...' : '최종 심사 승인 및 전송',
    onClick: handleFinalSubmit,
    disabled: isLoading || isTransferring,
    className: 'bg-[#003366] text-white hover:bg-[#002244]'
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
      <Header />
      
      <main className="flex-1 min-h-0 p-4 space-y-4 flex flex-col overflow-hidden">
        {/* 상단 레이아웃 공통 섹션 */}
        <section className="shrink-0">
          <LoanStepper />
        </section>
        
        <section className="shrink-0">
          <CustomerInfoForm />
        </section>
        
        <section className="shrink-0">
          <LoanTabs actionButton={approvalButton} />
        </section>

        {/* --- 메인 Split View 영역 --- */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden border border-[#556677] bg-white rounded-none">
          
          {/* Left Section (심사 리포트) */}
          <div 
            className="h-full flex flex-col relative bg-[#f8fafc]"
            style={{ width: `${leftWidthPercent}%` }}
          >
            {/* 상품 탭 영역 */}
            <ProductTabs />

            {/* 메인 리포트 스크롤 영역 */}
            <main className="flex-1 overflow-y-auto bg-[#e2e8f0] p-2 flex flex-col gap-2">
              {/* (Why) REST API로 데이터를 먼저 받았더라도, SSE 완료(isAllAuditDone)가 오기 전까지는 
                  사용자에게 2.5초 시뮬레이션 흐름을 일관되게 보여주기 위해 모달을 유지합니다. */}
              {isLoading || (!reviewData || !isAllAuditDone) ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white space-y-3 border border-[#cbd5e1]">
                  <Loader2 className="animate-spin text-[#004b93]" size={32} />
                  <div className="text-[11px] font-bold text-[#556677] uppercase tracking-widest animate-pulse">심사 결과 데이터를 분석 중입니다...</div>
                  {/* (Why) 백그라운드에서 SSE를 대기하는 동안 3단계 시뮬레이션 진행 상황 모달을 띄웁니다. */}
                  <ReportProgressModal isOpen={true} />
                </div>
              ) : isError ? (
               <div className="flex-1 flex flex-col items-center justify-center bg-[#fdf5f4] space-y-3 border border-[#fad2cf] p-6 text-center">
                 <AlertTriangle className="text-[#c5221f]" size={32} />
                 <div className="text-[12px] font-black text-[#a50e0e] uppercase">Data Fetching Error</div>
                 <div className="text-[10px] text-[#c5221f] font-medium max-w-[240px]">{(error as Error)?.message || "알 수 없는 전산 오류가 발생했습니다. 시스템 관리자에게 문의하세요."}</div>
                 <button onClick={() => window.location.reload()} className="mt-2 px-4 py-1.5 bg-[#c5221f] text-white font-bold rounded-[2px] text-[10px] uppercase hover:bg-[#a50e0e] shadow-sm transition-colors border border-[#a50e0e]">Retry Connection</button>
               </div>
             ) : (
               <>
                 {/* 상태 요약 보드 */}
                 <StatusSummaryBoard />
                 
                 {/* 한도 시각화 카드 */}
                 <LimitVisualizationCard />

                 {/* 상세 항목 리스트 */}
                 <ReviewDetailsList />
                 
                 {/* 하단 패널(임시 패딩) */}
                 <div className="h-2 shrink-0"></div>
               </>
             )}
            </main>
          </div>

          {/* Resizer 바 */}
          <div 
            className="w-1.5 bg-[#556677] hover:bg-[#004b93] cursor-col-resize shrink-0 transition-colors group relative z-40 border-x border-[#334455]"
            onMouseDown={startResizing}
          >
            {/* 드래그 용이성을 위해 투명 히트박스 확장 */}
            <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize"></div>
          </div>

          {/* Right Section (PDF 뷰어) */}
          <div className="h-full bg-slate-800 flex flex-col flex-1 relative min-w-[300px]">
            {/* FSD Widget: DocumentImageViewer */}
            <DocumentImageViewer 
              fileUrl={guidelineUrl ?? undefined} // (Why) 목업 PDF 대신 서버(Cloudflare)에서 받은 실제 URL을 사용합니다.
              files={MOCK_PDF_FILES}
              pageNumber={pdfPage}
              scale={pdfScale}
              onPageChange={setPdfPage}
              onScaleChange={setPdfScale}
              verificationId="RVW-2026-SYSTEM"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewReportPage;
