import { useVerificationStatus } from '../model/use-verification-status';
import { useVerificationActions } from '../model/use-verification-actions';

export const DeadEndPopup = () => {
  const { isBlocked, essentialMissings, terminationReason } = useVerificationStatus();
  const { handleEndService } = useVerificationActions();

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="w-[450px] bg-[#ece9d8] border border-[#003366] shadow-[4px_4px_10px_rgba(0,0,0,0.5)] flex flex-col font-sans select-none animate-in fade-in zoom-in-95 duration-200">

        <div className="h-7 bg-gradient-to-r from-[#0055e5] via-[#0a6cff] to-[#0055e5] flex items-center justify-between px-1.5 py-0.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-white text-[12px] font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]">
              Critical Error: 필수 서류 누락 안내
            </span>
          </div>
          <div className="flex gap-0.5">
            <button
              onClick={handleEndService}
              className="w-5 h-5 bg-[#e94b1a] border border-white/40 rounded-sm flex items-center justify-center shadow-inner text-white font-bold text-[10px] hover:bg-[#ff5b2b] transition-colors"
            >
              X
            </button>
          </div>
        </div>

        <div className="p-6 flex gap-4">
          <div className="shrink-0 text-4xl">❌</div>
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h3 className="text-[13px] font-bold text-[#cc0000]">
                심사를 진행할 수 없는 상태입니다.
              </h3>
              <p className="text-[11px] text-gray-700 leading-relaxed">
                {terminationReason === "위반건축물입니다. 심사를 종료합니다."
                  ? "제출하신 건축물대장 분석 결과 위반건축물로 판별되어 대출 심사가 불가합니다. 처음부터 다시 진행해 주시기 바랍니다."
                  : "사용자님의 직업 정보에 따라 아래의 필수 서류가 수집되지 않았거나 누락되었습니다. 관련 서류를 다시 준비하신 후 처음부터 진행해 주시기 바랍니다."}
              </p>
            </div>

            <div className="bg-white border border-[#7f9db9] p-3 space-y-2">
              <div className="text-[10px] font-bold text-blue-800 border-b border-gray-100 pb-1">
                {terminationReason === "위반건축물입니다. 심사를 종료합니다." ? "상세 사유" : "누락된 필수 서류 목록"}
              </div>
              <ul className="space-y-1">
                {terminationReason === "위반건축물입니다. 심사를 종료합니다." ? (
                  <li className="text-[11px] text-gray-600 flex items-center gap-2">
                    <span className="text-red-500">•</span> {terminationReason}
                  </li>
                ) : (
                  essentialMissings.map((doc, index) => (
                    <li key={index} className="text-[11px] text-gray-600 flex items-center gap-2">
                      <span className="text-red-500">•</span> {doc}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleEndService}
                className="px-6 py-1 bg-[#f0f0f0] border-t border-l border-white border-r-2 border-b-2 border-gray-500 text-[11px] font-medium active:border-t-2 active:border-l-2 active:border-r active:border-b active:border-white active:bg-gray-200"
              >
                가심사 종료하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};