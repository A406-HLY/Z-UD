import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDF_CONFIG } from '@/shared/config/pdf';

// 1. 내부망 전용 워커 경로 설정 (Shared Config 참조)
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CONFIG.WORKER_SRC;

interface Props {
  fileUrl?: string; // 백엔드 API로부터 전달받은 PDF 소스 URL
  pageNumber: number;
  scale: number;
  originalWidth?: number;
  originalHeight?: number;
  onLoadSuccess: (info: { width: number; height: number }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
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
export const PdfRenderer = ({ fileUrl, pageNumber, scale, originalWidth = 1240, originalHeight = 1754, onLoadSuccess, isLoading, setIsLoading }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  
  // (Point: 수동 메모리 관리를 위한 Ref 참조)
  const currentRenderTask = useRef<pdfjsLib.RenderTask | null>(null);

  // 1. [문서로드]: fileUrl이 변경될 때만 PDF 문서를 새롭게 파싱합니다.
  useEffect(() => {
    if (!fileUrl) {
      setPdfDoc(null);
      return;
    }

    let isMounted = true;
    const loadDocument = async () => {
      setIsLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: PDF_CONFIG.CMAP_URL, 
          cMapPacked: PDF_CONFIG.CMAP_PACKED,
        });
        const pdf = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(pdf);
        } else {
          pdf.destroy();
        }
      } catch (error) {
        console.error('PDF Document Loading Error:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
      if (pdfDoc) {
        pdfDoc.destroy().catch(console.error); 
      }
    };
  }, [fileUrl]); 

  // (Why: 화면 크기에 상관없이 원본 문서의 비율을 유지하며 줌(scale)을 적용합니다.)
  const BASE_VIEW_WIDTH = 800; // 가독성 좋은 표준 뷰어 너비
  const viewWidth = BASE_VIEW_WIDTH * scale;
  const viewHeight = (originalHeight / originalWidth) * viewWidth;

  // 2. [페이지 렌더링]: pdfDoc, pageNumber, scale이 변경될 때 Canvas에 다시 그립니다.
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc) {
        // (Why: 초기 대기 상태 혹은 로딩 실패 시 플레이스홀더 크기를 부모에게 리턴)
        onLoadSuccess({ width: viewWidth, height: viewHeight });
        return;
      }

      setIsLoading(true);

      try {
        // [Cleanup] 이전 렌더링 태스크 명시적 중단 (Memory Free)
        if (currentRenderTask.current) {
          currentRenderTask.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNumber);
        
        // (Note: 실제 렌더링 배율은 파일 크기에 맞춰 유동적으로 조절)
        const viewport = page.getViewport({ scale: viewWidth / page.getViewport({ scale: 1 }).width });

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

        // 3. 렌더링 태스크 실행 및 태스크 참조 저장
        currentRenderTask.current = page.render(renderContext);
        await currentRenderTask.current.promise;

        // (Why: 렌더링 완료 후 실제 픽셀 좌표 정보를 부모에게 통보 - Bbox 매핑용)
        onLoadSuccess({ 
          width: viewport.width, 
          height: viewport.height 
        });

        setIsLoading(false);
      } catch (error: unknown) {
        // (Point: unknown 타입 에러에 대해 타입 가드 활용)
        if (error instanceof Error && error.name === 'RenderingCancelledException') return; 
        console.error('PDF Page Render Error:', error);
        setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      if (currentRenderTask.current) {
        currentRenderTask.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale, originalWidth, originalHeight, onLoadSuccess, viewWidth, viewHeight]);

  return (
    <div className="relative shadow-2xl bg-white flex justify-center overflow-hidden shrink-0">
      {/* Actual Drawing Surface */}
      {fileUrl ? (
        <canvas ref={canvasRef} className="max-w-full h-auto shadow-inner" />
      ) : (
        <div 
          className="bg-gray-50 flex items-center justify-center border border-gray-300 transition-all shrink-0"
          style={{ width: `${viewWidth}px`, height: `${viewHeight}px` }}
        >
           <span className="text-gray-400 font-bold tracking-widest text-xs">
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
