import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { ExtractedField } from '@/entities/verification/model/types';
import { usePdfController } from '@/features/verification/model/use-pdf-controller';
import { PdfRenderer } from './PdfRenderer';
import { BboxOverlay } from './BboxOverlay';
import { useEffect, useState } from 'react';

interface Props {
  fields?: ExtractedField[];
  focusedFieldKey?: string | null;
  fileUrl?: string; 
  scale?: number;
  pageNumber?: number;
  onScaleChange?: (scale: number) => void;
  onPageChange?: (page: number) => void;
  verificationId?: string;
}

/**
 * @widget document-image-viewer
 * 심사 레포트 전용 PDF 뷰어 위젯입니다.
 * (Why: 단일 PDF 문서 내에서 다중 페이지를 탐색해야 하는 레포트 특성에 맞춰 페이지 전환 로직을 단순화했습니다.)
 */
export const ReportPdfViewer = ({ 
  fields = [], 
  focusedFieldKey = null, 
  fileUrl, 
  scale: externalScale,
  pageNumber: externalPageNumber,
  onScaleChange,
  onPageChange,
  verificationId
}: Props) => {
  const [totalPages, setTotalPages] = useState(1);
  const [outlineMap, setOutlineMap] = useState<Record<string, { pageNumber: number; yRatio: number }>>({});

  const {
    scale,
    setScale,
    pageNumber,
    setPageNumber,
    isLoading,
    setIsLoading,
    containerRef,
    renderedSize,
    setRenderedSize,
    bboxes,
    currentFileUrl
  } = usePdfController(fields, focusedFieldKey, [], fileUrl, {
    scale: externalScale,
    pageNumber: externalPageNumber,
    onScaleChange,
    onPageChange,
    outlineMap
  });
  
  const [baseWidth, setBaseWidth] = useState(800); 

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const measuredWidth = Math.max(300, rect.width - 100); 
        setBaseWidth(measuredWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [containerRef]);

  const handleOpenFull = () => {
    const width = window.screen.availWidth * 0.8;
    const height = window.screen.availHeight * 0.8;
    const left = (window.screen.availWidth - width) / 2;
    const top = (window.screen.availHeight - height) / 2;

    window.open(
      `/viewer/${verificationId || 'v-report'}?page=${pageNumber}&scale=${scale}`, 
      'PdfFullViewer', 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
    );
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#808080] overflow-hidden relative border-l border-gray-600">
      {/* 1. 뷰어 컨트롤 헤더 (중복 테두리 제거 및 높이 통일) */}
      <div className="h-[40px] bg-gray-200 border-b border-gray-300 flex items-center px-4 justify-between shrink-0 z-20">
        <span className="text-[11px] font-bold text-[#444] uppercase tracking-wider font-mono">
          Page {pageNumber}/{totalPages}
        </span>
        <div className="flex items-center gap-2">
          {/* Prev button */}
          <button
            type="button"
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-1.5 bg-white border border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <span className="text-[11px] font-mono font-bold w-12 text-center text-[#333]">
            {pageNumber} / {totalPages}
          </span>

          {/* Next button */}
          <button
            type="button"
            onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
            disabled={pageNumber >= totalPages}
            className="p-1.5 bg-white border border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          
          <div className="w-px h-5 bg-gray-400 mx-1" />

          <button 
            type="button"
            onClick={() => setScale(s => Math.max(0.4, Number((s - 0.2).toFixed(1))))} 
            className="p-1.5 bg-white border border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-gray-700" />
          </button>
          <span className="text-[10px] font-mono font-bold w-10 text-center text-gray-700">
            {Math.round(scale * 100)}%
          </span>
          <button 
            type="button"
            onClick={() => setScale(s => Math.min(3, Number((s + 0.2).toFixed(1))))} 
            className="p-1.5 bg-white border border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </button>
          <div className="w-px h-5 bg-gray-400 mx-2" />
          <button 
            type="button" 
            onClick={handleOpenFull}
            className="h-7 px-3 bg-white border border-gray-400 text-[10px] font-bold hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" /> FULL
          </button>
        </div>
      </div>
      
      {/* 2. 스크롤 가능한 캔버스 영역 */}
      <div className="flex-1 relative">
         {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 pointer-events-none">
              <div className="flex flex-col items-center gap-4 bg-[#f4f4f4] px-24 py-10 border-2 border-gray-400 shadow-xl">
                <div className="w-8 h-8 border-4 border-[#004b93] border-t-transparent rounded-full animate-spin" />
                <span className="text-[12px] font-bold text-[#333] tracking-[0.2em] uppercase font-mono">
                  LOADING REPORT
                </span>
              </div>
            </div>
         )}

         <div 
           ref={containerRef}
           className="absolute inset-0 overflow-auto p-12 flex justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
         >
           <div 
             className="relative shrink-0 transition-transform origin-top"
             style={{ 
               width: renderedSize.width > 0 ? `${renderedSize.width}px` : 'auto',
               height: renderedSize.height > 0 ? `${renderedSize.height}px` : 'auto',
               transform: `scale(${scale})` 
             }}
           >
              {/* (Point): Report 전용이므로 pageNumber를 그대로 전달합니다. */}
              <PdfRenderer 
                key={currentFileUrl}
                fileUrl={currentFileUrl} 
                pageNumber={pageNumber} 
                baseWidth={baseWidth}
                scale={scale}
                onLoadSuccess={setRenderedSize} 
                onDocumentLoad={({ numPages }) => setTotalPages(numPages)}
                onOutlineLoaded={setOutlineMap}
                setIsLoading={setIsLoading}
              />
              <BboxOverlay 
                bboxes={bboxes} 
                focusedFieldKey={focusedFieldKey} 
              />
           </div>
         </div>
      </div>
      
      {/* 3. 하단 메타데이터 바 */}
      <div className="h-[24px] bg-[#333] flex items-center px-4 gap-6 text-[9px] font-mono text-gray-400 uppercase shrink-0 z-20">
         <span>Report Viewer: PDF Engine</span>
         <span className="opacity-30">|</span>
         <span className="flex items-center gap-1.5">
           <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
           Status: {isLoading ? 'Rendering...' : 'Ready'}
         </span>
         <span className="opacity-30">|</span>
         <span>Page: {pageNumber} of {totalPages}</span>
      </div>
    </div>
  );
};
