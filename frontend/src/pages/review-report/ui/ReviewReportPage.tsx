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
import { createReportRequestPayload } from '@/entities/verification/model/report-factory';
import { MOCK_PDF_FILES } from '@/shared/config/pdfConfig';

import { Loader2, AlertTriangle } from 'lucide-react';
import { LoanTabs } from '@/widgets/loan-tabs';
import { useCreateReport } from '@/features/verification/api/use-create-report';

/**
 * @page review-report
 * 심사레포트 단계 최상위 화면 (데이터 연동 및 Split 뷰 스켈레톤)
 */
export const ReviewReportPage = () => {
  // 0. Redux 상태 구독 (지연 조립을 위한 원천 데이터)
  const customerData = useSelector((state: RootState) => state.customer.data);
  const { ocrData, creditData, loanData } = useSelector((state: RootState) => state.audit.data);
  const edits = useSelector((state: RootState) => state.verification.edits);

  const consultationId = customerData.consultationId || "CONS-2026-TEMP-001";
  const { 
    isLoading, 
    isError, 
    error, 
    pdfPage, 
    setPdfPage, 
    pdfScale, 
    setPdfScale 
  } = useReviewReportController(consultationId);

  // 1. API Mutation 훅 초기화
  const { mutate: createReport, isPending: isSubmitting } = useCreateReport();

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

  // 3. 최종 데이터 조립 핸들러 (Simulation)
  const handleFinalSubmit = useCallback(() => {
    // (Why) 여러 문서에 흩어진 수정 내역을 하나의 평탄화된 객체로 병합합니다.
    const allEditsValues: Record<string, any> = {};
    Object.values(edits).forEach(docEdit => {
      Object.assign(allEditsValues, docEdit.values);
    });

    try {
      // 팩토리 함수를 호출하여 최종 API 페이로드 생성
      const payload = createReportRequestPayload(
        ocrData as any,
        allEditsValues,
        customerData,
        creditData,
        loanData
      );

      console.log('🚀 [Simulation] 최종 가심사 리포트 페이로드:', payload);
      
      // (Why) 실제 API 호출을 수행합니다. useMutation 기반이므로 비동기 전처리는 훅 내부에서 담당합니다.
      createReport(payload);
    } catch (err) {
      console.error('❌ 데이터 조립 중 오류 발생:', err);
    }
  }, [ocrData, customerData, creditData, loanData, edits, createReport]);

  // 4. 전산 액션 버튼 정의
  const approvalButton = {
    label: isSubmitting ? '전송 중...' : '최종 심사 승언 및 전송',
    onClick: handleFinalSubmit,
    disabled: isLoading || isSubmitting,
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
        <div ref={containerRef} className="flex-1 flex overflow-hidden border border-gray-300 bg-white rounded-sm">
          
          {/* Left Section (심사 리포트) */}
          <div 
            className="h-full bg-white flex flex-col relative"
            style={{ width: `${leftWidthPercent}%` }}
          >
            {/* 상품 탭 영역 */}
            <ProductTabs />

            {/* 메인 리포트 스크롤 영역 */}
            <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-3 flex flex-col space-y-4">
              {isLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center bg-white space-y-3 border border-gray-200">
                 <Loader2 className="animate-spin text-blue-600" size={32} />
                 <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">심사 결과 데이터를 분석 중입니다...</div>
               </div>
             ) : isError ? (
               <div className="flex-1 flex flex-col items-center justify-center bg-red-50 space-y-3 border border-red-200 p-6 text-center">
                 <AlertTriangle className="text-red-500" size={32} />
                 <div className="text-[12px] font-black text-red-800 uppercase">Data Fetching Error</div>
                 <div className="text-[10px] text-red-600 font-medium max-w-[240px]">{(error as Error)?.message || "알 수 없는 전산 오류가 발생했습니다. 시스템 관리자에게 문의하세요."}</div>
                 <button onClick={() => window.location.reload()} className="mt-2 px-4 py-1.5 bg-red-600 text-white font-bold rounded-sm text-[10px] uppercase hover:bg-red-700 shadow-sm">Retry Connection</button>
               </div>
             ) : (
               <>
                 {/* 상태 요약 보드 */}
                 <StatusSummaryBoard />
                 
                 {/* 한도 시각화 카드 */}
                 <LimitVisualizationCard />

                 {/* 상세 항목 리스트 */}
                 <ReviewDetailsList />
                 
                 {/* 하단 패널(임시 전송 버튼 등 기능 확장용 패딩) */}
                 <div className="h-4 shrink-0"></div>
               </>
             )}
            </main>
          </div>

          {/* Resizer 바 */}
          <div 
            className="w-1.5 bg-gray-300 hover:bg-blue-400 cursor-col-resize shrink-0 transition-colors group relative z-40 border-r border-indigo-200"
            onMouseDown={startResizing}
          >
            {/* 드래그 용이성을 위해 투명 히트박스 확장 */}
            <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize"></div>
          </div>

          {/* Right Section (PDF 뷰어) */}
          <div className="h-full bg-slate-800 flex flex-col flex-1 relative min-w-[300px]">
            {/* FSD Widget: DocumentImageViewer */}
            <DocumentImageViewer 
              fileUrl="/mock-guideline.pdf"
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
