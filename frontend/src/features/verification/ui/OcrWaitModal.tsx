import { useAppSelector } from '@/app/store/hooks';
import { clsx } from 'clsx';
import { Search, FileText, Loader2, AlertCircle } from 'lucide-react';

/**
 * @feature Verification/UI
 * (Why) 서류 전송 후 OCR 분석이 완료될 때까지 사용자에게 실시간 진행 상황을 시각적으로 전달하여 이탈을 방지합니다.
 * Windows XP의 시스템 분석 스타일을 차용하여 디자인 일관성을 유지합니다.
 */
export const OcrWaitModal = () => {
  const { steps, currentMessage, data } = useAppSelector((state) => state.audit);
  const ocrStatus = steps.ocr;
  
  // (Why) ocrData가 이미 존재하지 않고, 현재 진행 중이거나 에러 상태일 때 모달을 유지합니다.
  const isOpen = ocrStatus === 'LOADING' || ocrStatus === 'ERROR' || (ocrStatus === 'IDLE' && !data.ocrData);
  
  if (!isOpen) return null;

  const isError = ocrStatus === 'ERROR';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="w-[420px] bg-[#ece9d8] border border-[#003366] shadow-[4px_4px_15px_rgba(0,0,0,0.6)] flex flex-col font-sans select-none overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Title Bar (Classic Windows XP Blue) */}
        <div className="h-7 bg-linear-to-r from-[#0055e5] via-[#0a6cff] to-[#0055e5] flex items-center justify-between px-2 py-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
          <div className="flex items-center gap-2 pl-1">
            <Search className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[12px] font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
              {isError ? '분석 도중 오류 발생' : '스마트 서류 분석 엔진 가동 중...'}
            </span>
          </div>
          <div className="flex gap-1">
             <button className="w-5 h-5 bg-[#e94b1a] border border-white/40 rounded-sm flex items-center justify-center hover:bg-[#ff5b2a] shadow-inner text-white font-bold text-[10px]">X</button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-white px-4 py-3 flex items-start gap-4 border-b border-[#d6d3c1]">
          <div className="p-2 bg-blue-50 rounded-full">
            <Search className={clsx("w-8 h-8 text-blue-600", !isError && "animate-pulse")} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-800">서류 진위 확인 및 데이터 추출</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">서버에서 AI가 서류의 항목들을 정밀 분석하고 있습니다.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-5 bg-[#f1eee2]">
          
          {/* Scanning Animation Area */}
          <div className="relative h-24 bg-white border border-[#7f9db9] rounded-sm flex items-center justify-center overflow-hidden">
             {/* Animation Background Overlay */}
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-30"></div>
             
             {!isError ? (
               <div className="relative w-full flex flex-col items-center">
                 <div className="flex gap-8 items-center">
                    <div className="relative">
                      <FileText className="w-10 h-10 text-slate-400" />
                      <div className="absolute inset-0 bg-linear-to-b from-blue-400/0 via-blue-400/40 to-blue-400/0 h-full w-full animate-ocr-scan border-y border-blue-500/50"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      <span className="text-[10px] text-blue-700 font-bold mt-1 uppercase tracking-tighter">Processing</span>
                    </div>
                    <div className="relative">
                      <Search className="w-10 h-10 text-blue-500 animate-bounce" />
                    </div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center text-red-600">
                 <AlertCircle className="w-10 h-10" />
                 <span className="text-[11px] font-bold mt-2">일시적인 오류가 발생했습니다.</span>
               </div>
             )}
          </div>

          {/* Real-time Status & Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-end px-0.5">
              <span className="text-[11px] font-bold text-[#003366] flex items-center gap-1.5 line-clamp-1">
                <span className="w-1 h-1 bg-blue-600 rounded-full animate-ping"></span>
                {currentMessage}
              </span>
              <span className="text-[10px] font-mono text-slate-500 animate-pulse">Running...</span>
            </div>
            
            {/* XP Styled Progress Bar */}
            <div className="h-[18px] bg-white border border-[#7f9db9] p-0.5 overflow-hidden shadow-inner relative">
              <div 
                className={clsx(
                   "h-full w-full absolute inset-0 transition-opacity duration-300", 
                   isError ? "bg-red-500/20" : "animate-ocr-progress"
                )}
                style={{
                  backgroundImage: !isError ? `
                    linear-gradient(90deg, 
                      #7bb200 0px, #b4e34e 2px, #7bb200 4px,
                      transparent 4px, transparent 10px,
                      #7bb200 10px, #b4e34e 12px, #7bb200 14px,
                      transparent 14px, transparent 20px,
                      #7bb200 20px, #b4e34e 22px, #7bb200 24px,
                      transparent 24px, transparent 140px
                    )
                  ` : 'none',
                  backgroundSize: '140px 100%',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
              <div className="absolute inset-0 bg-linear-to-b from-white/20 via-transparent to-black/10 pointer-events-none"></div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-[#d6d3c1]/30 border border-[#d6d3c1] p-2 rounded-xs">
             <div className="flex flex-col text-[10px] text-slate-600 gap-1 font-sans">
                <div className="flex justify-between">
                  <span className="opacity-70">분석 단계:</span>
                  <span className="font-bold text-slate-800">{isError ? '오류' : ocrStatus === 'IDLE' ? '준비 대기' : '동적 분석 중'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">엔진 상태:</span>
                  <span className="font-bold text-blue-700">ACTIVE_HYPER_OCR</span>
                </div>
             </div>
          </div>
        </div>

        {/* Global CSS for unique animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes ocr-scan {
            0% { top: -10%; }
            100% { top: 110%; }
          }
          @keyframes ocr-chase {
            0% { background-position: -140px 0; }
            100% { background-position: 420px 0; }
          }
          .animate-ocr-scan {
            animation: ocr-scan 2s ease-in-out infinite;
          }
          .animate-ocr-progress {
            animation: ocr-chase 2s linear infinite;
          }
        `}} />
      </div>
    </div>
  );
};
