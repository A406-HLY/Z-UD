import { Maximize2, Image as ImageIcon } from 'lucide-react';

/**
 * @widget document-image-viewer
 * 원본 서류 이미지를 표시하고 스캐닝 효과를 제공합니다.
 * (Why: 육안 검증 및 OCR 프로세스 진행 상태 시각화)
 */
export const DocumentImageViewer = () => {
  return (
    <div className="flex-[1.3] h-full flex flex-col bg-[#808080] overflow-hidden relative border-l border-gray-300">
      {/* Viewer Header */}
      <div className="h-[32px] bg-gray-200 border-b border-gray-300 flex items-center px-3 justify-between shrink-0 z-20">
        <span className="text-[10px] font-bold text-[#444] uppercase tracking-wider font-mono">Image-Buffer: 0xFD2A</span>
        <button className="h-6 px-3 bg-white border border-gray-400 text-[9px] font-bold hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors active:scale-95">
          <Maximize2 className="w-3 h-3" /> FULL SCREEN
        </button>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-12 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
         <div className="w-full max-w-[500px] aspect-[1.58/1] bg-white border-2 border-black shadow-2xl relative overflow-hidden shrink-0 group">
            {/* Mock ID Card UI (Simulation) */}
            <div className="absolute inset-0 p-8 flex flex-col gap-6 opacity-80">
               <div className="flex justify-between items-start">
                  <div className="w-[100px] h-[120px] bg-gray-100 border border-gray-300 flex items-center justify-center">
                     <ImageIcon className="w-10 h-10 text-gray-300" />
                  </div>
                  <div className="flex-1 pl-8 space-y-4">
                     <div className="h-4 w-3/4 bg-gray-200" />
                     <div className="h-4 w-1/2 bg-gray-200" />
                     <div className="h-4 w-full bg-gray-200" />
                  </div>
               </div>
               <div className="mt-auto h-[50px] bg-gray-50 border border-dashed border-gray-300" />
            </div>
            
            {/* Scanning Laser Animation Effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600 shadow-[0_0_15px_rgba(220,38,38,1)] z-10 animate-bounce" />
            <div className="absolute inset-0 bg-[#004b93]/5 pointer-events-none" />
         </div>
      </div>
      
      {/* Metadata Bar */}
      <div className="h-[24px] bg-[#333] flex items-center px-4 gap-6 text-[8px] font-mono text-gray-400 uppercase">
         <span>Engine: V4.2_CORE</span>
         <span className="opacity-30">|</span>
         <span>Confidence: 98.2%</span>
         <span className="opacity-30">|</span>
         <span>DPI: 300</span>
      </div>
    </div>
  );
};
