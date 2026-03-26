import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDF_CONFIG } from '@/shared/config/pdf';

// 1. 내부망 워커 경로 설정 (Shared Config 참조)
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CONFIG.WORKER_SRC;

interface Props {
  fileUrl: string; // PDF 데이터 소스 URL (내부 API 또는 Blob/ArrayBuffer)
}

/**
 * @widget InternalPdfViewer
 * 금융권 폐쇄망 최적화 저수준 PDF 렌더러
 * - Canvas 렌더링을 통한 텍스트 복사 원천 차단
 * - 문서 전환 시 기존 메모리(Doc, Task) 즉시 해제
 * - 로컬 CMap 참조를 통한 한글 깨짐 방지
 */
const InternalPdfViewer: React.FC<Props> = ({ fileUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // (Point: 메모리 누수 방지를 위한 가비지 컬렉션 수동 제어용 Ref)
  const currentRenderTask = useRef<any>(null);
  const currentPdfDoc = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      if (!fileUrl) return;

      setIsLoading(true);

      try {
        // [Cleanup] 이전 문서 로직 및 렌더링 태스크 명시적 종료
        if (currentRenderTask.current) {
          currentRenderTask.current.cancel();
        }
        if (currentPdfDoc.current) {
          await currentPdfDoc.current.destroy();
          currentPdfDoc.current = null;
        }

        // 2. 문서 로드 (CMap 로컬 절대 경로 필수 설정)
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: PDF_CONFIG.CMAP_URL,
          cMapPacked: PDF_CONFIG.CMAP_PACKED,
        });

        const pdf = await loadingTask.promise;
        currentPdfDoc.current = pdf;

        const page = await pdf.getPage(1); // 1페이지 우선 렌더링 (금융권 스펙: 평균 3장)
        const viewport = page.getViewport({ scale: 1.5 }); // 가독성을 위한 인치당 픽셀 배율

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // 3. 렌더링 태스크 실행 및 참조 저장
        currentRenderTask.current = page.render(renderContext);
        await currentRenderTask.current.promise;

        setIsLoading(false);
      } catch (error: any) {
        // 렌더링 취소는 정상적인 흐름(문서 전환)이므로 에러 처리에서 제외
        if (error.name === 'RenderingCancelledException') return;
        console.error('PDF rendering failed:', error);
        setIsLoading(false);
      }
    };

    renderPdf();

    // [Step 2 클린업]: 컴포넌트 언마운트 시 물리적 메모리 자원 해제
    return () => {
      if (currentRenderTask.current) {
        currentRenderTask.current.cancel();
      }
      if (currentPdfDoc.current) {
        currentPdfDoc.current.destroy();
      }
      // 캔버스 사이즈 초기화로 메모리 반환 유도
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [fileUrl]);

  return (
    <div className="relative flex flex-col items-center bg-slate-100 min-h-full overflow-auto p-8 border border-slate-200">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 transition-opacity">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#004b93] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-bold text-[#004b93] uppercase tracking-widest">Optimizing View...</p>
          </div>
        </div>
      )}

      {/* Actual PDF Surface */}
      <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-300">
        <canvas ref={canvasRef} className="max-w-full h-auto" />
      </div>

      {/* 보안용 투명 오버레이 (드래그/우클릭 차단) */}
      <div className="absolute inset-x-0 top-0 bottom-0 z-10 select-none pointer-events-none" />
    </div>
  );
};

export default InternalPdfViewer;
