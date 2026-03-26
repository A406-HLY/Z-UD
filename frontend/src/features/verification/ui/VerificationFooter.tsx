import { useVerificationStatus } from '../model/use-verification-status';
import { useVerificationActions } from '../model/use-verification-actions';
import { Button } from '@/shared/ui';

/**
 * @feature verification/ui/VerificationFooter
 * 검증 페이지 하단에 위치하며, 다음 단계 진행을 제어합니다.
 * (Why: 필수 서류 누락 여부에 따라 버튼을 비활성화하여 오프로세스 진행을 원천 차단합니다.)
 */
export const VerificationFooter = () => {
  const { isBlocked, isLoading } = useVerificationStatus();
  const { handleNextStep } = useVerificationActions();

  return (
    <footer className="h-16 border-t border-gray-300 bg-white flex items-center justify-between px-6 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Current Progress</span>
        <span className="text-[12px] font-black text-[#004b93] uppercase">OCR Verification & Correction</span>
      </div>

      <div className="flex items-center gap-3">
        {isBlocked && (
          <div className="flex flex-col items-end mr-2">
            <span className="text-[11px] text-red-600 font-bold animate-pulse">
              ⚠️ 필수 서류 누락 발생
            </span>
            <span className="text-[9px] text-gray-400">관련 내용을 팝업에서 확인하세요.</span>
          </div>
        )}
        
        <Button
          onClick={handleNextStep}
          disabled={isBlocked || isLoading}
          variant={isBlocked ? 'secondary' : 'primary'}
          className={`
            h-10 px-10 rounded-none font-bold text-[13px] transition-all
            ${!isBlocked && !isLoading ? 'shadow-[2px_2px_0px_#002b55] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none' : ''}
          `}
        >
          {isBlocked ? '진행 불가 (서류 누락)' : '검증 완료 및 다음 단계로'}
        </Button>
      </div>
    </footer>
  );
};
