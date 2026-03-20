import { clsx } from 'clsx';
import { Button } from '@/shared/ui';
import { LOAN_PROCESS_TABS, DOCUMENT_VIEWER_LABELS } from '@/entities/loan-document/model/document.constants';

interface LoanTabsProps {
  onNextStep?: () => void;
  isNextStepPending?: boolean;
  isScanComplete?: boolean; // (Why) 스캔 완료 여부에 따라 버튼 활성화 및 가이드를 제어합니다.
}

/**
 * @widget LoanTabs
 * 대출 프로세스 탭 네비게이션 위젯입니다.
 * (Why) 현재 진행중인 단계를 시각적으로 표시하며, 상수를 분리하여 프로세스 확장에 유연하게 대응합니다.
 */
export const LoanTabs = ({ onNextStep, isNextStepPending, isScanComplete }: LoanTabsProps) => {
  const activeTab = 'docs'; // (Why) 현재는 서류제출 단계로 고정되어 있으며, 추후 라우팅 상태와 연동 가능합니다.

  return (
    <div className="flex justify-between items-center bg-white border border-gray-200">
      <div className="flex h-8">
        {LOAN_PROCESS_TABS.map((tab) => {
          const isNextTarget = isScanComplete && tab.id === 'result';
          
          return (
            <button
              key={tab.id}
              className={clsx(
                'px-4 h-full text-[11px] font-bold transition-all border-r border-gray-200 relative overflow-hidden',
                activeTab === tab.id
                  ? 'bg-[#004b93] text-white' // 활성 탭 (신한 블루)
                  : isNextTarget
                    ? 'bg-blue-50 text-[#004b93] animate-pulse border-b-2 border-b-[#004b93]' // 다음 단계 가이드 (B2B스럽게 강조)
                    : 'bg-white text-gray-500 hover:bg-gray-50'
              )}
            >
              {tab.label}
              {isNextTarget && (
                <span className="absolute top-0 right-1 text-[8px] font-black text-[#004b93] opacity-50">NEXT</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-2">
        {onNextStep && (
          <Button 
            size="sm" 
            variant="primary"
            className={clsx(
              "h-6 text-[10px] px-4 font-bold transition-all duration-500",
              isScanComplete ? "bg-[#004b93] shadow-md" : "bg-gray-200 text-gray-400 border-gray-100"
            )}
            onClick={onNextStep}
            disabled={isNextStepPending || !isScanComplete}
            isLoading={isNextStepPending}
          >
            {isNextStepPending ? DOCUMENT_VIEWER_LABELS.UPLOADING_STATUS : DOCUMENT_VIEWER_LABELS.NEXT_STEP_BUTTON}
          </Button>
        )}
      </div>
    </div>
  );
};
