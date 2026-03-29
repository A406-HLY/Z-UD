import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/store/hooks';

interface ReportProgressModalProps {
  isOpen: boolean;
}

type StepStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

/**
 * @widget ReportProgressModal
 * 리포트 생성 단계의 진행 상황을 (Backend SSE 부재로 인해) 프론트엔드 시뮬레이션 타이머 기반으로 시각화합니다.
 */
export const ReportProgressModal = ({ isOpen }: ReportProgressModalProps) => {
  const { currentMessage, steps: auditSteps } = useAppSelector((state) => state.audit);
  const reportStatus = auditSteps.report;
  const reviewData = useAppSelector((state) => state.review.data);

  // (Why) 4단계 진행 상황을 위한 로컬 상태 관리
  const [steps, setSteps] = useState<StepStatus[]>(['IDLE', 'IDLE', 'IDLE', 'IDLE']);

  useEffect(() => {
    if (!isOpen) return;

    // 1.0s ~ 2.5s: 내규 검색 중
    // (Why) 사용자 요구사항에 따른 4단계 시뮬레이션 타이머 설정
    // 0 ~ 1.0s: 심사 결과 수신 중
    // 1.0s ~ 2.2s: 내규 위반 분석 중
    // 2.2s ~ 렌더링 전: 리포트 작성 중
    
    const timer1 = setTimeout(() => {
      setSteps([ 'SUCCESS', 'LOADING', 'IDLE', 'IDLE' ]);
    }, 1000);

    const timer2 = setTimeout(() => {
      setSteps([ 'SUCCESS', 'SUCCESS', 'LOADING', 'IDLE' ]);
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

  // (Why) 실제 리포트 데이터(reviewData)가 도착하면 "리포트 작성 중" 단계로 강제 진입합니다.
  useEffect(() => {
    if (reviewData) {
      setSteps(['SUCCESS', 'SUCCESS', 'LOADING', 'IDLE']);
    }
  }, [reviewData]);

  // (Why) 최종적으로 리포트가 렌더링되어 SUCCESS 상태가 되면 모든 단계를 완료 처리합니다.
  useEffect(() => {
    if (reportStatus === 'SUCCESS') {
      setSteps(['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS']);
    }
  }, [reportStatus]);

  // (Why) Redux 상태가 LOADING이거나 상위에서 isOpen을 명시적으로 주었을 때 팝업을 유지합니다.
  // 단, 이미 리포트가 성공적으로 렌더링(SUCCESS)된 상태라면 팝업을 즉시 닫습니다.
  const isVisible = (isOpen || reportStatus === 'LOADING') && reportStatus !== 'SUCCESS';

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      {/* Windows XP Window Frame */}
      <div className="w-[420px] bg-[#ece9d8] border border-[#003366] shadow-[2px_2px_15px_rgba(0,0,0,0.6)] flex flex-col font-sans select-none animate-in zoom-in-95 duration-200">
        
        {/* Title Bar */}
        <div className="h-6 bg-linear-to-r from-[#0055e5] via-[#0a6cff] to-[#0055e5] flex items-center justify-between px-1.5 py-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-white text-[11px] font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
              심사 리포트 및 내규 분석 진행 중 (Simulation)
            </span>
          </div>
          <div className="flex gap-0.5">
            <button className="w-4 h-4 bg-[#e94b1a] border border-white/30 rounded-sm flex items-center justify-center shadow-inner text-white font-bold text-[9px] opacity-50 cursor-not-allowed">
              O
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-4">
          
          {/* Top Visual Area (XP Animation) */}
          <div className="relative h-24 bg-white border border-[#7f9db9] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
            
            <div className="w-full h-full flex flex-col items-center justify-center px-6">
              <div className="relative w-full flex items-center justify-between px-4 mt-1">
                <div className="z-10 flex flex-col items-center">
                  <span className="text-3xl drop-shadow-sm">🖥️</span>
                  <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase">Analysis Office</span>
                </div>

                <div className="flex-1 px-4 relative h-10 overflow-hidden">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 animate-packet-seq-req text-[12px] opacity-0 z-20">📄</div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 animate-packet-seq-res text-[12px] opacity-0 z-20">📊</div>
                </div>

                <div className="z-10 flex flex-col items-center">
                  <span className="text-3xl drop-shadow-sm animate-pulse-slow">🌐</span>
                  <span className="text-[8px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">Central System</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-[#333] mt-3 whitespace-pre-wrap text-center px-4 italic leading-tight">
                {currentMessage || '심사 및 내규 대조 분석을 진행 중입니다...'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[#333] mb-1">리포트 상세 생성 시뮬레이션</div>
            
            <div className="space-y-1.5 bg-white border border-[#7f9db9] p-2">
              <ProgressRow label="심사 진행 중" status={steps[0]} />
              <ProgressRow label="내규 검색 중" status={steps[1]} />
              <ProgressRow label="리포트 생성 중" status={steps[2]} />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes packet-seq-req {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          40% { opacity: 1; }
          50% { left: 100%; opacity: 0; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes packet-seq-res {
          0% { right: 0%; opacity: 0; }
          50% { right: 0%; opacity: 0; }
          60% { opacity: 1; }
          90% { opacity: 1; }
          100% { right: 100%; opacity: 0; }
        }
        .animate-packet-seq-req {
          animation: packet-seq-req 2.5s infinite linear;
        }
        .animate-packet-seq-res {
          animation: packet-seq-res 2.5s infinite linear;
        }
        @keyframes xp-chase {
          0% { background-position: -140px 0; }
          100% { background-position: 420px 0; }
        }
        .animate-xp-progress {
          animation: xp-chase 3s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 1px rgba(0, 107, 182, 0.4)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(0, 107, 182, 0.6)); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

// --- Helper Component: ProgressRow ---
const ProgressRow = ({ label, status }: { label: string; status: StepStatus }) => {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <div className="w-[120px] font-mono text-slate-600 truncate">{label}</div>
      <div className="flex-1 h-[12px] bg-slate-100 border border-slate-300 p-px relative overflow-hidden">
        {status === 'LOADING' && (
          <div className="absolute inset-0 bg-[#b4d455] animate-xp-progress"
               style={{
                 backgroundImage: `linear-gradient(90deg, #b4e34e 0px, #7bb200 1px, #578000 5px, #b4e34e 6px, transparent 6px, transparent 8px, #b4e34e 8px, #7bb200 9px, #578000 13px, #b4e34e 14px, transparent 14px, transparent 16px, #b4e34e 16px, #7bb200 17px, #578000 21px, #b4e34e 22px, transparent 22px, transparent 24px, #b4e34e 24px, #7bb200 25px, #578000 29px, #b4e34e 30px, transparent 30px, transparent 32px, #b4e34e 32px, #7bb200 33px, #578000 37px, #b4e34e 38px, transparent 38px, transparent 140px)`,
                 backgroundSize: '140px 100%'
               }}
          />
        )}
        {status === 'SUCCESS' && (
          <div className="absolute inset-0 bg-[#004b93] transition-all duration-300" style={{ width: '100%' }} />
        )}
        {status === 'ERROR' && (
          <div className="absolute inset-0 bg-red-500" style={{ width: '100%' }} />
        )}
        {status === 'IDLE' && (
           <div className="absolute inset-0 bg-transparent" />
        )}
      </div>
      <div className="w-12 text-right font-bold shrink-0">
        {status === 'IDLE' && <span className="text-slate-400">대기</span>}
        {status === 'LOADING' && <span className="text-[#7bb200]">처리 중</span>}
        {status === 'SUCCESS' && <span className="text-blue-600">완료</span>}
        {status === 'ERROR' && <span className="text-red-500">실패</span>}
      </div>
    </div>
  );
};
