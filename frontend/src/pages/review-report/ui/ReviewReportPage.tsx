import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from '@/widgets/header';
import { CustomerInfoForm } from '@/widgets/customer-info-form';
import { LoanStepper } from '@/widgets/loan-stepper/ui/LoanStepper';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setReviewData, selectProcessedProducts, selectSelectedArticle } from '@/entities/review/model/review.slice';
import { ConsultationResponse } from '@/entities/review/model/types';
import { ProductTabs, StatusSummaryBoard, LimitVisualizationCard } from '@/widgets/review-summary';
import { ReviewDetailsList } from '@/widgets/review-details';
import { DocumentImageViewer } from '@/widgets/document-image-viewer/ui/DocumentImageViewer';

const DUMMY_DATA: ConsultationResponse = {
  consultationId: "REQ-2026-001",
  result: {
    "ssadimdol": {
      "ltv": { name_ko: "LTV 잔여 한도(%)", value: 60, matched_articles: ["제1조"], result: "승인", reason: "기준 이하" },
      "dsr": { name_ko: "DSR 잔여 한도(%)", value: 30, matched_articles: ["제2조"], result: "승인", reason: "기준 이하" },
      "income": { name_ko: "소득 심사", value: "적격", matched_articles: [], result: "승인", reason: "근로소득 확인" },
      "credit": { name_ko: "CB사 신용 평가", value: "1등급", matched_articles: ["내규-신용-01"], result: "승인", reason: "우량 등급" }
    },
    "ssageumjari": {
      "ltv": { name_ko: "LTV 제한", value: 85, matched_articles: ["제3조"], result: "거절", reason: "LTV 한도 초과" },
      "house": { name_ko: "주택보유수", value: 2, matched_articles: [], result: "자료 보완 요망", reason: "추가 증빙 필요" }
    }
  }
};

const ARTICLE_PAGE_MAP: Record<string, number> = {
  "제1조": 1,
  "제2조": 2,
  "제3조": 3,
  "내규-신용-01": 4,
};

const MOCK_PDF_FILES = [
  { fileId: "p1", pageNum: 1 },
  { fileId: "p2", pageNum: 2 },
  { fileId: "p3", pageNum: 3 },
  { fileId: "p4", pageNum: 4 },
];

/**
 * @page review-report
 * 심사레포트 단계 최상위 화면 (데이터 연동 및 Split 뷰 스켈레톤)
 */
export const ReviewReportPage = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProcessedProducts);
  const selectedArticle = useAppSelector(selectSelectedArticle);
  
  // 1. Split View 조절 로직
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(55);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // PDF 뷰어 연동 상태
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.2);

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

  // 2. 초기 데이터 주입 (Redux 연동 확인용)
  useEffect(() => {
    dispatch(setReviewData(DUMMY_DATA));
  }, [dispatch]);

  // 3. 조항 클릭 시 PDF 스크롤(페이지 이동) 싱크
  useEffect(() => {
    if (selectedArticle && selectedArticle.length > 0) {
      const targetRule = selectedArticle[0];
      const targetPage = ARTICLE_PAGE_MAP[targetRule];
      if (targetPage) {
        setPdfPage(targetPage);
      }
    }
  }, [selectedArticle]);

  return (
    <div className="h-screen bg-[#f1f5f9] flex flex-col font-sans text-[11px] overflow-hidden">
      {/* --- 상단 고정 영역 --- */}
      <div className="shrink-0 flex flex-col z-30 shadow-sm border-b border-gray-300">
        <Header />
        
        {/* 시스템 툴바 (참고용) */}
        <div className="bg-white border-b border-gray-300 px-4 py-1 flex justify-between items-center z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-[11px] font-black text-slate-800 uppercase italic">Final Credit Audit Consolidation</h2>
            <div className="h-3 w-px bg-gray-300"></div>
            <div className="flex gap-3 font-bold text-[#003366] text-[9px]">
               <span>NO: {products.length > 0 ? "REQ-2026-001" : "LOADING..."}</span>
               <span>STATUS: <span className="text-blue-600 underline">AUDITING</span></span>
            </div>
          </div>
        </div>

        {/* 진행 상태 및 공유 컴포넌트 */}
        <div className="bg-white px-4 py-1 border-b border-gray-200">
          <LoanStepper />
        </div>
        <div className="bg-slate-50 border-b border-gray-300">
           <CustomerInfoForm />
        </div>
      </div>

      {/* --- 메인 Split View 영역 --- */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        
        {/* Left Section (심사 리포트) */}
        <div 
          className="h-full bg-white flex flex-col relative"
          style={{ width: `${leftWidthPercent}%` }}
        >
          {/* 상품 탭 영역 */}
          <ProductTabs />

          {/* 메인 리포트 스크롤 영역 */}
          <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-3 flex flex-col space-y-4">
            {/* 상태 요약 보드 */}
            <StatusSummaryBoard />
            
            {/* 한도 시각화 카드 */}
            <LimitVisualizationCard />

            {/* 상세 항목 리스트 */}
            <ReviewDetailsList />
            
            {/* 하단 패널(임시 전송 버튼 등 기능 확장용 패딩) */}
            <div className="h-4 shrink-0"></div>
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
    </div>
  );
};

export default ReviewReportPage;
