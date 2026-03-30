import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';

interface AuditProgressModalProps {
  isOpen: boolean;
}

export const AuditProgressModal = ({ isOpen }: AuditProgressModalProps) => {
  const navigate = useNavigate();
  const { currentMessage, steps, isAllAuditDone } = useAppSelector((state) => state.audit);

  useEffect(() => {
    if (isAllAuditDone) {
      const timer = setTimeout(() => {
        navigate('/customer-info');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAllAuditDone, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="w-[420px] bg-[#ece9d8] border border-[#003366] shadow-[2px_2px_15px_rgba(0,0,0,0.6)] flex flex-col font-sans select-none animate-in zoom-in-95 duration-200">

        <div className="h-6 bg-linear-to-r from-[#0055e5] via-[#0a6cff] to-[#0055e5] flex items-center justify-between px-1.5 py-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-white text-[11px] font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
              {isAllAuditDone ? '심사 완료' : '종합 심사 진행 중...'}
            </span>
          </div>
          <div className="flex gap-0.5">
            <button className="w-4 h-4 bg-[#e94b1a] border border-white/30 rounded-sm flex items-center justify-center shadow-inner text-white font-bold text-[9px] opacity-50 cursor-not-allowed">
              X
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">

          <div className="relative h-24 bg-white border border-[#7f9db9] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

            {isAllAuditDone ? (
              <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <span className="text-4xl text-blue-600">✅</span>
                <span className="text-[11px] font-bold text-[#004b93] mt-2 tracking-wide">모든 심사 프로세스 완료</span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center px-6">
                {}
                <div className="relative w-full flex items-center justify-between px-4 mt-1">

                  <div className="z-10 flex flex-col items-center">
                    <span className="text-3xl drop-shadow-sm">🖥️</span>
                    <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase">My Computer</span>
                  </div>

                  <div className="flex-1 px-4 relative h-10 overflow-hidden">
                    {}
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2"></div>

                    {}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 animate-packet-seq-req text-[12px] opacity-0 z-20">🔵</div>

                    {}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 animate-packet-seq-res text-[12px] opacity-0 z-20">🟢</div>
                  </div>

                  <div className="z-10 flex flex-col items-center">
                    <span className="text-3xl drop-shadow-sm">🌐</span>
                    <span className="text-[8px] font-bold text-blue-600 mt-1 uppercase">Bank API</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#333] mt-3 whitespace-pre-wrap text-center px-4">
                  {currentMessage === '연결 대기 중...' ? '서버 연결 및 데이터 스트림 수신 대기 중...' : currentMessage}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[#333] mb-1">세부 심사 항목</div>

            <div className="space-y-1.5 bg-white border border-[#7f9db9] p-2">
              <ProgressRow label="마이데이터 신용등급 조회" status={steps.credit} />
              <ProgressRow label="마이데이터 기존 대출 조회" status={steps.loanHistory} />
              <ProgressRow label="담보물(주택) 적격성 심사" status={steps.houseAudit} />
            </div>
          </div>
        </div>
      </div>

      {}
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
        @keyframes xp-chase {
          0% { background-position: -140px 0; }
          100% { background-position: 420px 0; }
        }
        .animate-packet-seq-req {
          animation: packet-seq-req 2.5s infinite linear;
        }
        .animate-packet-seq-res {
          animation: packet-seq-res 2.5s infinite linear;
        }
        .animate-xp-progress {
          animation: xp-chase 3s linear infinite;
        }
      `}} />
    </div>
  );
};

const ProgressRow = ({ label, status }: { label: string; status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' }) => {
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
          <div className="absolute inset-0 bg-blue-500 transition-all duration-300" style={{ width: '100%' }} />
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
        {status === 'LOADING' && <span className="text-[#7bb200]">조회 중</span>}
        {status === 'SUCCESS' && <span className="text-blue-600">완료</span>}
        {status === 'ERROR' && <span className="text-red-500">오류</span>}
      </div>
    </div>
  );
};