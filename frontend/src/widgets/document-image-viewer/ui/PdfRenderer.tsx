import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDF_CONFIG } from '@/shared/config/pdf';
import { extractOutlineMap } from '@/shared/lib/pdf/pdf-utils';

// 1. 내부망 전용 워커 경로 설정 (Shared Config 참조)
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CONFIG.WORKER_SRC;

interface Props {
  fileUrl?: string; // 백엔드 API로부터 전달받은 PDF 소스 URL
  pageNumber: number;
  scale: number;
  baseWidth: number; // 부모 컨테이너로부터 전달받은 가로 기준값
  onLoadSuccess: (info: { width: number; height: number }) => void;
  onDocumentLoad?: (info: { numPages: number }) => void;
  onOutlineLoaded?: (outlineMap: Record<string, { pageNumber: number; yRatio: number }>) => void;
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
export const PdfRenderer = ({ fileUrl, pageNumber, scale, baseWidth, onLoadSuccess, onDocumentLoad, onOutlineLoaded, setIsLoading }: Props) => {
  const lowResCanvasRef = useRef<HTMLCanvasElement>(null);
  const highResCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(0);
  const [renderPhase, setRenderPhase] = useState<'empty' | 'low' | 'high'>('empty');
  
  // (Point: 수동 메모리 관리를 위한 Ref 참조)
  const lowResRenderTask = useRef<pdfjsLib.RenderTask | null>(null);
  const highResRenderTask = useRef<pdfjsLib.RenderTask | null>(null);

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
          onDocumentLoad?.({ numPages: pdf.numPages });
          
          // [추가] 목차(Outline) 정보 추출 및 상위 레이어 전달
          extractOutlineMap(pdf).then(map => {
            if (isMounted) onOutlineLoaded?.(map);
          });
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

  // (Point: 레이아웃 크기는 항상 1배율(baseWidth)로 고정합니다. 줌은 부모에서 CSS transform으로 처리합니다.)
  const viewWidth = baseWidth;
  const viewHeight = viewWidth * aspectRatio;

  // 2. [페이지 렌더링]: pdfDoc, pageNumber, scale이 변경될 때 Canvas에 다시 그립니다.
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc) {
        // (Why: 초기 대기 상태 혹은 로딩 실패 시 플레이스홀더 크기를 부모에게 리턴 - 초기 비율은 A4로 가정)
        // (Why: 파일 로드 전에는 비율 정보를 전달하지 않아 초기 렌더링 오차를 방지합니다.)
        onLoadSuccess({ width: viewWidth, height: 0 });
        return;
      }

      setIsLoading(true);

      try {
        // [Cleanup] 이전 태스크 중단
        lowResRenderTask.current?.cancel();
        highResRenderTask.current?.cancel();
        setRenderPhase('empty');

        const page = await pdfDoc.getPage(pageNumber);
        const originalViewport = page.getViewport({ scale: 1 });
        const newAspectRatio = originalViewport.height / originalViewport.width;
        setAspectRatio(newAspectRatio);

        // 부모에게 실제 크기 통보 (Bbox 매핑용)
        onLoadSuccess({ width: viewWidth, height: viewWidth * newAspectRatio });

        const dpr = Math.max(window.devicePixelRatio || 1, 2.0); 

        // --- PHASE 1: Low-Res Render (Fast) ---
        const lowResViewport = page.getViewport({ scale: (viewWidth * dpr) / originalViewport.width });
        const lowResCanvas = lowResCanvasRef.current;
        if (lowResCanvas) {
          const context = lowResCanvas.getContext('2d');
          if (context) {
            lowResCanvas.width = lowResViewport.width;
            lowResCanvas.height = lowResViewport.height;
            lowResRenderTask.current = page.render({ canvasContext: context, viewport: lowResViewport });
            await lowResRenderTask.current.promise;
            setRenderPhase('low');
            setIsLoading(false); // 1단계 완료 시 로딩 해제 (사용자 경험 우선)
          }
        }

        // --- PHASE 2: High-Res Render (Background 2.5x) ---
        // (Why: 사용자의 줌 조작을 대비하여 미리 고해상도(2.5배) 비트맵을 생성합니다.)
        const HIGH_RES_SCALE = 2.5;
        const highResViewport = page.getViewport({ scale: (viewWidth * HIGH_RES_SCALE * dpr) / originalViewport.width });
        const highResCanvas = highResCanvasRef.current;
        if (highResCanvas) {
          const context = highResCanvas.getContext('2d');
          if (context) {
            highResCanvas.width = highResViewport.width;
            highResCanvas.height = highResViewport.height;
            highResRenderTask.current = page.render({ canvasContext: context, viewport: highResViewport });
            await highResRenderTask.current.promise;
            setRenderPhase('high');
          }
        }
      } catch (error: unknown) {
        // (Point: unknown 타입 에러에 대해 타입 가드 활용)
        if (error instanceof Error && error.name === 'RenderingCancelledException') return; 
        console.error('PDF Page Render Error:', error);
        setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      lowResRenderTask.current?.cancel();
      highResRenderTask.current?.cancel();
    };
  }, [pdfDoc, pageNumber, baseWidth, onLoadSuccess]);

  return (
    <div 
      className="relative shadow-2xl bg-white flex justify-center overflow-hidden shrink-0"
      style={{ width: `${viewWidth}px`, height: `${viewHeight}px` }}
    >
      {/* 1. Low-Res Layer (Fast Start) */}
      <canvas 
        ref={lowResCanvasRef} 
        className={`absolute inset-0 w-full h-full shadow-inner transition-opacity duration-300 ${renderPhase === 'high' ? 'opacity-0' : 'opacity-100'}`} 
      />
      
      {/* 2. High-Res Layer (High Quality Swap) */}
      <canvas 
        ref={highResCanvasRef} 
        className={`absolute inset-0 w-full h-full shadow-inner transition-opacity duration-500 ${renderPhase === 'high' ? 'opacity-100' : 'opacity-0'}`} 
      />

      {/* (Why: 아직 아무것도 로드되지 않았을 때의 상태) */}
      {renderPhase === 'empty' && !fileUrl && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center border border-gray-300">
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
