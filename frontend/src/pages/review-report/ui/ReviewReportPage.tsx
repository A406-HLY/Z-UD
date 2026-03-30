import { useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Header } from '@/widgets/header';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';

import { ProductTabs, StatusSummaryBoard, LimitVisualizationCard } from '@/widgets/review-summary';
import { ReviewDetailsList } from '@/widgets/review-details';
import { useReviewReportController } from '@/features/review/model/use-review-report-controller';
import {
  createReportRequestPayload,
  createLegacyTransferPayload,
  mapReportToBankSystemFormat
} from '@/entities/verification/model/report-factory';
import { ReportProgressModal } from '@/widgets/review-summary/ui/ReportProgressModal';
import { ReportPdfViewer } from '@/widgets/document-image-viewer/ui/ReportPdfViewer';
import { Loader2, AlertTriangle } from 'lucide-react';
import { LoanTabs } from '@/widgets/loan-tabs';
import { transferConsultationToLegacy } from '@/entities/customer/api/customer.api';

export const ReviewReportPage = () => {
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
    guidelineUrl
  } = useReviewReportController(consultationId);

  const [isTransferring, setIsTransferring] = useState(false);

  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(55);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const newWidth = ((moveEvent.clientX - left) / width) * 100;
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

  const handleFinalSubmit = useCallback(async () => {
    if (!consultationId || consultationId.includes("TEMP")) {
      alert("유효한 상담 ID가 존재하지 않습니다.");
      return;
    }

    try {
      setIsTransferring(true);

      const allEditsValues: Record<string, any> = {};
      Object.values(edits).forEach(docEdit => {
        Object.assign(allEditsValues, docEdit.values);
      });

      const basePayload = createReportRequestPayload(
        ocrData as any,
        allEditsValues,
        customerData as any,
        creditData,
        loanData
      );

      const transferPayload = createLegacyTransferPayload(
        basePayload.reportInput,
        customerData as any,
        "싸금자리"
      );

      await transferConsultationToLegacy(consultationId, transferPayload);

      const uiPayload = mapReportToBankSystemFormat(transferPayload);
      const channel = new BroadcastChannel('bank-system-transfer');
      channel.postMessage(uiPayload);
      channel.close();

      alert('✅ 통합 전산망으로 최종 심사 결과가 성공적으로 전송(이관)되었습니다!');

    } catch (err: any) {

      alert(`전송 실패: ${err?.response?.data?.message || err.message}`);
    } finally {
      setIsTransferring(false);
    }
  }, [ocrData, customerData, creditData, loanData, edits, consultationId]);

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
        <section className="shrink-0">
          <LoanStepper />
        </section>

        <section className="shrink-0">
          <CustomerInfoForm />
        </section>

        <section className="shrink-0">
          <LoanTabs actionButton={approvalButton} />
        </section>

        <div ref={containerRef} className="flex-1 flex overflow-hidden border border-[#556677] bg-white rounded-none">

          <div
            className="h-full flex flex-col relative bg-[#f8fafc]"
            style={{ width: `${leftWidthPercent}%` }}
          >
            <ProductTabs />

            <main className="flex-1 overflow-y-auto bg-[#e2e8f0] p-2 flex flex-col gap-2">
              {}
              {isLoading || (!reviewData || !isAllAuditDone) ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white space-y-3 border border-[#cbd5e1]">
                  <Loader2 className="animate-spin text-[#004b93]" size={32} />
                  <div className="text-[11px] font-bold text-[#556677] uppercase tracking-widest animate-pulse">심사 결과 데이터를 분석 중입니다...</div>
                  {}
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
                 <StatusSummaryBoard />

                 <LimitVisualizationCard />

                 <ReviewDetailsList />

                 <div className="h-2 shrink-0"></div>
               </>
             )}
            </main>
          </div>

          <div
            className="w-1.5 bg-[#556677] hover:bg-[#004b93] cursor-col-resize shrink-0 transition-colors group relative z-40 border-x border-[#334455]"
            onMouseDown={startResizing}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize"></div>
          </div>

          <div className="h-full bg-slate-800 flex flex-col flex-1 relative min-w-[300px]">
            <ReportPdfViewer
              fileUrl={guidelineUrl ?? undefined}
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