import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { ExtractedField } from '@/entities/verification/model/types';
import { usePdfController } from '@/features/verification/model/use-pdf-controller';
import { PdfRenderer } from './PdfRenderer';
import { BboxOverlay } from './BboxOverlay';

interface Props {
  fields?: ExtractedField[];
  focusedFieldKey?: string | null;
  fileUrl?: string; // 백엔드에서 추후 전달받을 실제 PDF 주소
  originalWidth?: number; // 원본 해상도 폭
}

/**
 * @widget document-image-viewer
 * 실제 PDF 렌더링 및 OCR 좌표 기반 Bounding Box 오버레이를 담당하는 메인 위젯 컨테이너입니다.
 * (Why: 하위 세부 컴포넌트와 비즈니스 로직(Hook)을 결합하여 캡슐화하고 외부에는 데이터 Props만 노출합니다.)
 */
export const DocumentImageViewer = ({ fields = [], focusedFieldKey = null, fileUrl, originalWidth }: Props) => {
  const {
    scale, setScale,
    pageNumber,
    containerRef,
    setRenderedSize,
    scaledBboxes
  } = usePdfController(fields, focusedFieldKey, originalWidth);

  return (
    <div className="flex-[1.3] h-full flex flex-col bg-[#808080] overflow-hidden relative border-l border-gray-300">
      {/* 1. 뷰어 컨트롤 헤더 */}
      <div className="h-[40px] bg-gray-200 border-b border-gray-300 flex items-center px-4 justify-between shrink-0 z-20">
        <span className="text-[11px] font-bold text-[#444] uppercase tracking-wider font-mono">
          Page {pageNumber}
        </span>
        <div className="flex items-center gap-2">
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
          <button type="button" className="h-7 px-3 bg-white border border-gray-400 text-[10px] font-bold hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors">
            <Maximize2 className="w-3.5 h-3.5" /> FULL
          </button>
        </div>
      </div>
      
      {/* 2. 스크롤 가능한 캔버스 영역 (Auto-Focus 컨테이너) */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-12 flex justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] relative"
      >
        <div className="relative shrink-0 transition-transform origin-top">
           <PdfRenderer 
             fileUrl={fileUrl} 
             pageNumber={pageNumber} 
             scale={scale} 
             onLoadSuccess={setRenderedSize} 
           />
           <BboxOverlay 
             bboxes={scaledBboxes} 
             focusedFieldKey={focusedFieldKey} 
           />
        </div>
      </div>
      
      {/* 3. 하단 메타데이터 바 */}
      <div className="h-[24px] bg-[#333] flex items-center px-4 gap-6 text-[9px] font-mono text-gray-400 uppercase shrink-0">
         <span>Viewer: React-PDF Engine</span>
         <span className="opacity-30">|</span>
         <span>Bboxes: {scaledBboxes.length} Active</span>
      </div>
    </div>
  );
};
