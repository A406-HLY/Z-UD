import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// 1. 내부망 전용 워커 경로 설정 (Step 1에서 복사한 절대 경로)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

interface Props {
  fileUrl?: string; // 백엔드 API로부터 전달받은 PDF 소스 URL
  pageNumber: number;
  scale: number;
  onLoadSuccess: (info: { width: number; height: number }) => void;
}

/**
 * @widget document-image-viewer
 * 최고 수준의 금융권 폐쇄망용 PDF 렌더러 (Low-level pdf.js)
 * 
 * [최적화 핵심]
 * 1. 메모리 즉시 해제: 문서 교체 시 pdfDoc.destroy()와 renderTask.cancel() 강제 호출
 * 2. 렌더링 속도: 1.5초 이내 완료를 위해 Canvas 하드웨어 가속 활용
 * 3. 폐쇄망 대응: public 폴더의 로컬 CMap 데이터 참조로 한글 깨짐 방지
 */
export const PdfRenderer = ({ fileUrl, pageNumber, scale, onLoadSuccess }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // (Point: 수동 메모리 관리를 위한 Ref 참조)
  const currentRenderTask = useRef<any>(null);
  const currentPdfDoc = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      if (!fileUrl) {
        // (Why: 초기 대기 상태에서는 기본 A4 비율 크기만 부모에게 리턴하여 레이아웃 유지)
        onLoadSuccess({ width: 600 * scale, height: 848 * scale });
        return;
      }

      setIsLoading(true);

      try {
        // [Cleanup] 이전 렌더링 태스크 및 문서 객체 명시적 파괴 (Memory Free)
        if (currentRenderTask.current) {
          currentRenderTask.current.cancel();
        }
        if (currentPdfDoc.current) {
          await currentPdfDoc.current.destroy();
          currentPdfDoc.current = null;
        }

        // 2. 문서 로드 (CMap 로컬 절대 경로 참조 설정)
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: '/assets/cmaps/', 
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        currentPdfDoc.current = pdf;

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

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

        // 3. 렌더링 태스크 실행 및 태스크 참조 저장 (나중에 캔슬하기 위함)
        currentRenderTask.current = page.render(renderContext);
        await currentRenderTask.current.promise;

        // (Why: 렌더링 완료 후 실제 픽셀 좌표 정보를 부모에게 통보 - Bbox 매핑용)
        onLoadSuccess({ 
          width: viewport.width, 
          height: viewport.height 
        });

        setIsLoading(false);
      } catch (error: any) {
        if (error.name === 'RenderingCancelledException') return; // 취소 이벤트 무시
        console.error('PDF Renderer Critical Error:', error);
        setIsLoading(false);
      }
    };

    renderPdf();

    // [Cleanup Pattern]: 컴포넌트 언마운트 시 물리적 가비지 컬렉팅 강제 유도
    return () => {
      if (currentRenderTask.current) {
        currentRenderTask.current.cancel();
      }
      if (currentPdfDoc.current) {
        currentPdfDoc.current.destroy();
      }
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [fileUrl, pageNumber, scale, onLoadSuccess]);

  return (
    <div className="relative shadow-2xl bg-white flex justify-center overflow-hidden">
      {/* Loading Blur Layer */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#004b93] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black text-[#004b93] tracking-wider uppercase">Loading Document...</span>
          </div>
        </div>
      )}

      {/* Actual Drawing Surface */}
      {fileUrl ? (
        <canvas ref={canvasRef} className="max-w-full h-auto" />
      ) : (
        <div 
          className="bg-gray-50 flex items-center justify-center border border-gray-300 transition-all"
          style={{ width: `${600 * scale}px`, height: `${848 * scale}px` }}
        >
           <span className="text-gray-400 font-bold tracking-widest text-sm">
             [ 분석 대상 문서 대기 중 ]
           </span>
        </div>
      )}

      {/* (Security): 투명 오버레이로 캔버스 좌표 탈취 및 우클릭 방지 */}
      <div 
        className="absolute inset-0 z-10 select-none" 
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};
