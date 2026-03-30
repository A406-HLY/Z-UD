import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { clsx } from 'clsx';
import { Search, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// ─── 시뮬레이션 메시지 풀 (3페이즈, 이모티콘 없음) ───

/** Phase 1: 서류 식별 (0~15초) */
const PHASE1_MESSAGES = [
  '제출된 서류 목록을 수집하고 있습니다...',
  '주민등록등본 문서 유형을 식별하고 있습니다...',
  '건축물대장 페이지 레이아웃을 분석 중...',
  '가족관계증명서 서식 버전을 판별하고 있습니다...',
  '등기부등본 갑구/을구 영역을 분리하는 중...',
  '매매계약서 페이지 수와 구조를 확인 중...',
  '원천징수영수증 서식 코드를 매칭하고 있습니다...',
];

/** Phase 2: 항목 추출 (15~35초) */
const PHASE2_MESSAGES = [
  '등본에서 세대주 성명 항목을 추출하고 있습니다...',
  '주민등록번호 마스킹 영역을 해독하는 중...',
  '매매계약서의 매매금액을 파싱 중...',
  '건축물대장에서 주용도 및 면적 정보를 읽는 중...',
  '등기부등본 소유자 변동 이력을 추적하고 있습니다...',
  '가족관계증명서에서 배우자 정보를 확인 중...',
  '전입세대 열람 내역의 이사일자를 정규화하는 중...',
  '원천징수영수증에서 연소득 합계를 계산하고 있습니다...',
  '건강보험자격득실확인서 가입자 구분을 판별 중...',
];

/** Phase 3: 교차 검증 (35~50초) */
const PHASE3_MESSAGES = [
  '등본 주소와 매매계약서 소재지를 대조하고 있습니다...',
  '소유자 정보의 일관성을 검증하는 중...',
  '세대주 성명과 가족관계증명서를 크로스체크 중...',
  '매매금액과 등기부 권리 설정 내역을 비교 분석 중...',
  '건축물대장 위반 건축물 여부를 최종 확인하고 있습니다...',
  '전체 서류 간 주민번호 일치 여부를 검증하는 중...',
  '추출된 데이터의 무결성을 최종 점검하고 있습니다...',
];

const ALL_PHASES = [PHASE1_MESSAGES, PHASE2_MESSAGES, PHASE3_MESSAGES];

/**
 * (Why) 경과 시간에 따라 적절한 페이즈를 결정합니다.
 * 0~15초: Phase1, 15~35초: Phase2, 35초~: Phase3
 */
const getPhaseIndex = (elapsedMs: number): number => {
  if (elapsedMs < 15000) return 0;
  if (elapsedMs < 35000) return 1;
  return 2;
};

/**
 * @feature Verification/UI
 * (Why) 서류 전송 후 OCR 분석이 완료될 때까지 사용자에게 실시간 진행 상황을 시각적으로 전달하여 이탈을 방지합니다.
 * 3페이즈 시뮬레이션 메시지를 2.5초 간격으로 자동 로테이션하며, AI가 실제로 파싱하고 있다는 체감을 제공합니다.
 */
export const OcrWaitModal = () => {
  const { steps, data } = useAppSelector((state) => state.audit);
  const ocrStatus = steps.ocr;
  
  // (Why) ocrData가 이미 존재하지 않고, 현재 진행 중이거나 에러 상태일 때 모달을 유지합니다.
  const shouldBeOpen = ocrStatus === 'LOADING' || ocrStatus === 'ERROR' || (ocrStatus === 'IDLE' && !data.ocrData);

  // ─── 완료 후 1.5초 딜레이를 위한 상태 ───
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // (Why) ocrData가 도착하면 즉시 닫지 않고, "서류 분석 완료" 메시지를 1.5초간 보여준 뒤 닫습니다.
  useEffect(() => {
    if (data.ocrData && !isCompleted) {
      setIsCompleted(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [data.ocrData, isCompleted]);

  // (Why) 모달이 열려야 할 때 visible 상태를 동기화합니다.
  useEffect(() => {
    if (shouldBeOpen && !isCompleted) {
      setIsVisible(true);
    }
  }, [shouldBeOpen, isCompleted]);

  // ─── 시뮬레이션 메시지 로테이션 ───
  const [currentMsg, setCurrentMsg] = useState(PHASE1_MESSAGES[0]);
  const [logHistory, setLogHistory] = useState<string[]>([PHASE1_MESSAGES[0]]);
  const startTimeRef = useRef(Date.now());
  const phaseIndexRef = useRef<number[]>([0, 0, 0]); // 각 페이즈별 현재 인덱스

  const advanceMessage = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const phase = getPhaseIndex(elapsed);
    const messages = ALL_PHASES[phase];
    
    // 현재 페이즈 내 인덱스를 순환
    const nextIdx = (phaseIndexRef.current[phase] + 1) % messages.length;
    phaseIndexRef.current[phase] = nextIdx;
    
    const nextMsg = messages[nextIdx];
    setCurrentMsg(nextMsg);
    setLogHistory(prev => [...prev.slice(-3), nextMsg]); // 최근 4개 유지
  }, []);

  useEffect(() => {
    if (!isVisible || isCompleted) return;
    
    startTimeRef.current = Date.now();
    const interval = setInterval(advanceMessage, 2500);
    return () => clearInterval(interval);
  }, [isVisible, isCompleted, advanceMessage]);

  // (Why) 완료 시 로그 히스토리에 최종 완료 메시지를 추가합니다.
  useEffect(() => {
    if (isCompleted) {
      setCurrentMsg('모든 서류 분석이 완료되었습니다.');
      setLogHistory(prev => [...prev.slice(-3), '모든 서류 분석이 완료되었습니다.']);
    }
  }, [isCompleted]);

  if (!isVisible) return null;

  const isError = ocrStatus === 'ERROR';
  // (Why) 경과 시간 기반 예상 진행률 (50초 기준, 최대 95%까지만 - 완료 시 100%)
  const progressPercent = isCompleted ? 100 : undefined;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="w-[460px] bg-[#ece9d8] border border-[#003366] shadow-[4px_4px_15px_rgba(0,0,0,0.6)] flex flex-col font-sans select-none overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Title Bar (Classic Windows XP Blue) */}
        <div className="h-7 bg-linear-to-r from-[#0055e5] via-[#0a6cff] to-[#0055e5] flex items-center justify-between px-2 py-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
          <div className="flex items-center gap-2 pl-1">
            <Search className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[12px] font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
              {isCompleted ? '서류 분석 완료' : isError ? '분석 도중 오류 발생' : '스마트 서류 분석 엔진 가동 중...'}
            </span>
          </div>
          <div className="flex gap-1">
             <button className="w-5 h-5 bg-[#e94b1a] border border-white/40 rounded-sm flex items-center justify-center shadow-inner text-white font-bold text-[10px] opacity-50 cursor-not-allowed">X</button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-white px-4 py-3 flex items-start gap-4 border-b border-[#d6d3c1]">
          <div className="p-2 bg-blue-50 rounded-full">
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            ) : (
              <Search className={clsx("w-8 h-8 text-blue-600", !isError && "animate-pulse")} />
            )}
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-slate-800">
              {isCompleted ? '서류 분석이 성공적으로 완료되었습니다' : '서류 진위 확인 및 데이터 추출'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isCompleted 
                ? '잠시 후 검증 결과 화면으로 전환됩니다.' 
                : 'AI 엔진이 제출된 서류의 항목들을 정밀 분석하고 있습니다.'}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4 bg-[#f1eee2]">
          
          {/* Scanning Animation Area */}
          <div className="relative h-20 bg-white border border-[#7f9db9] rounded-sm flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-30"></div>
             
             {isCompleted ? (
               <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                 <CheckCircle2 className="w-10 h-10 text-blue-600" />
                 <span className="text-[11px] font-bold text-[#004b93] mt-2 tracking-wide">ALL DOCUMENTS VERIFIED</span>
               </div>
             ) : !isError ? (
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

          {/* Current Message Display */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2 pb-0.5">
                {/* Ping Animation Dot (Separated from line-clamp to prevent cutoff) */}
                <div className="relative flex items-center justify-center w-2 h-2 shrink-0">
                  {!isCompleted && <span className="absolute inset-0 bg-blue-600 rounded-full animate-ping"></span>}
                  <span className="relative w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                </div>
                <span className="text-[11px] font-bold text-[#003366] line-clamp-1 flex-1">
                  {currentMsg}
                </span>
              </div>
              <span className={clsx(
                "text-[10px] font-mono shrink-0 mb-0.5",
                isCompleted ? "text-blue-600 font-bold" : "text-slate-500 animate-pulse"
              )}>
                {isCompleted ? 'Completed' : 'Running...'}
              </span>
            </div>
            
            {/* XP Styled Progress Bar */}
            <div className="h-[18px] bg-white border border-[#7f9db9] p-0.5 overflow-hidden shadow-inner relative">
              {isCompleted ? (
                <div className="absolute inset-0 bg-[#004b93] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              ) : isError ? (
                <div className="absolute inset-0 bg-red-500/20" />
              ) : (
                <div 
                  className="h-full w-full absolute inset-0 animate-ocr-progress"
                  style={{
                    backgroundImage: `linear-gradient(90deg, 
                      #7bb200 0px, #b4e34e 2px, #7bb200 4px,
                      transparent 4px, transparent 10px,
                      #7bb200 10px, #b4e34e 12px, #7bb200 14px,
                      transparent 14px, transparent 20px,
                      #7bb200 20px, #b4e34e 22px, #7bb200 24px,
                      transparent 24px, transparent 140px
                    )`,
                    backgroundSize: '140px 100%',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}
              <div className="absolute inset-0 bg-linear-to-b from-white/20 via-transparent to-black/10 pointer-events-none"></div>
            </div>
          </div>

          {/* Terminal-style Log Area */}
          <div className="bg-[#1a1a2e] border border-[#333] rounded-sm p-2.5 font-mono text-[10px] leading-relaxed min-h-[88px] max-h-[88px] overflow-hidden flex flex-col justify-end">
            <div className="text-slate-500 mb-1 text-[9px] uppercase tracking-wider shrink-0">-- analysis log --</div>
            {logHistory.slice(-3).map((msg, idx) => {
              const isLast = idx === logHistory.slice(-3).length - 1;
              const isCompletionMsg = msg === '모든 서류 분석이 완료되었습니다.';
              return (
                <div 
                  key={`${msg}-${idx}`}
                  className={clsx(
                    "transition-all duration-300 truncate shrink-0",
                    isLast && !isCompletionMsg ? "text-green-400" : 
                    isCompletionMsg ? "text-blue-400 font-bold" :
                    "text-slate-600"
                  )}
                >
                  <span className="text-slate-700 mr-1.5">&gt;</span>
                  {msg}
                </div>
              );
            })}
          </div>

          {/* Details */}
          <div className="bg-[#d6d3c1]/30 border border-[#d6d3c1] p-2 rounded-xs">
             <div className="flex flex-col text-[10px] text-slate-600 gap-1 font-sans">
                <div className="flex justify-between">
                  <span className="opacity-70">분석 단계:</span>
                  <span className="font-bold text-slate-800">
                    {isCompleted ? '완료' : isError ? '오류' : ocrStatus === 'IDLE' ? '준비 대기' : '동적 분석 중'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">엔진 상태:</span>
                  <span className={clsx("font-bold", isCompleted ? "text-blue-700" : "text-blue-700")}>
                    {isCompleted ? 'ANALYSIS_COMPLETE' : 'ACTIVE_HYPER_OCR'}
                  </span>
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
