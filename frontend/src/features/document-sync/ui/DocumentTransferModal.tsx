import { clsx } from 'clsx';

interface DocumentTransferModalProps {
  isOpen: boolean;
  customerName?: string;
  mode?: 'scan' | 'upload';
}

export const DocumentTransferModal = ({ isOpen, customerName, mode = 'upload' }: DocumentTransferModalProps) => {
  if (!isOpen) return null;

  const isScan = mode === 'scan';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="w-[380px] bg-[#ece9d8] border border-[#003366] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex flex-col font-sans select-none animate-in zoom-in-95 duration-200">

        <div className="h-6 bg-linear-to-r from-[#0055e5] via-[#0a6cff] to-[#0055e5] flex items-center justify-between px-1.5 py-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-white text-[11px] font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
              {isScan ? '서류 불러오는 중...' : '서류 전송 중...'}
            </span>
          </div>
          <div className="flex gap-0.5">
            <button className="w-4 h-4 bg-[#e94b1a] border border-white/30 rounded-sm flex items-center justify-center hover:bg-[#ff5b2a] shadow-inner text-white font-bold text-[9px]">X</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative h-16 bg-white border border-[#7f9db9] flex items-center justify-between px-8 overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

            <div className="z-10 flex flex-col items-center">
              <span className="text-2xl">{isScan ? '📠' : '📁'}</span>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{isScan ? 'Scanner' : 'Staging'}</span>
            </div>

            <div className="absolute left-[80px] right-[80px] top-1/2 -translate-y-1/2 overflow-hidden h-12 flex items-center">
              <div className="animate-flying-paper whitespace-nowrap flex gap-12 text-xl">
                <span>📄</span>
                <span>📑</span>
                <span>📄</span>
                <span>📑</span>
              </div>
            </div>

            <div className="z-10 flex flex-col items-center">
              <div className="relative">
                <span className="text-2xl">{isScan ? '📁' : '🌍'}</span>
                {!isScan && (
                  <div className="absolute -top-1 -right-1 animate-pulse">
                    <span className="text-[10px]">☁️</span>
                  </div>
                )}
              </div>
              <span className={clsx("text-[9px] font-bold mt-1 uppercase", isScan ? "text-slate-400" : "text-blue-500")}>
                {isScan ? 'Staging' : 'Portal'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-[#333]">
              <span className="font-bold">
                {isScan ? '스캐너에서 파일을 가져오는 중...' : '파일을 서버로 복사하는 중...'}
              </span>
            </div>

            <div className="h-[14px] bg-white border border-[#7f9db9] p-px overflow-hidden shadow-inner relative">
              <div
                className="h-full w-full absolute inset-0 animate-xp-progress"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg,
                      #b4e34e 0px, #7bb200 1px, #578000 5px, #b4e34e 6px,
                      transparent 6px, transparent 8px,
                      #b4e34e 8px, #7bb200 9px, #578000 13px, #b4e34e 14px,
                      transparent 14px, transparent 16px,
                      #b4e34e 16px, #7bb200 17px, #578000 21px, #b4e34e 22px,
                      transparent 22px, transparent 24px,
                      #b4e34e 24px, #7bb200 25px, #578000 29px, #b4e34e 30px,
                      transparent 30px, transparent 32px,
                      #b4e34e 32px, #7bb200 33px, #578000 37px, #b4e34e 38px,
                      transparent 38px, transparent 140px
                    )
                  `,
                  backgroundSize: '140px 100%',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="absolute inset-0 bg-linear-to-b from-white/30 via-transparent to-black/10 pointer-events-none"></div>
              </div>
            </div>

            <div className="flex flex-col text-[10px] text-slate-500 font-mono mt-2 gap-0.5">
              <div className="flex justify-between">
                <span>대상: {isScan ? 'Local Staging Area' : 'SSAFY Cloud Storage'}</span>
                <span>{isScan ? '서류 스캔 중...' : '서류 전송 중...'}</span>
              </div>
              <div className="flex justify-between">
                <span>성함: {customerName || '고객님'}</span>
                <span>상태: {isScan ? 'WAITING_SCAN' : 'UPLOADING'}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button className="px-6 py-0.5 bg-[#f0f0f0] border border-[#adb2b5] text-[11px] shadow-[inset_0_1px_0_white] hover:bg-[#fafafa] active:bg-[#e0e0e0] font-sans">최소화</button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flying-paper {
            0% { transform: translateX(-50px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(250px); opacity: 0; }
          }
          @keyframes xp-chase {
            0% { background-position: -140px 0; }
            100% { background-position: 420px 0; }
          }
          .animate-flying-paper {
            animation: flying-paper 1.8s linear infinite;
          }
          .animate-xp-progress {
            /* (Why) 사용자의 요청에 따라 가감속(cubic-bezier)을 제거하고 일정한 속도(linear)로 움직이도록 수정합니다. */
            animation: xp-chase 3s linear infinite;
          }
        `}} />
      </div>
    </div>
  );
};