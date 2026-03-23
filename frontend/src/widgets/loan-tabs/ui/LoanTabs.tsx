import { useNavigate, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/shared/ui';
import { LOAN_PROCESS_TABS, DOCUMENT_VIEWER_LABELS } from '@/entities/loan-document/model/document.constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoanTabsProps {
  onNextStep?: () => void;
  isNextStepPending?: boolean;
  isScanComplete?: boolean; // (Why) 스캔 완료 여부에 따라 버튼 활성화 및 가이드를 제어합니다.
}

/**
 * @widget LoanTabs
 * 대출 프로세스 탭 네비게이션 위젯입니다.
 */
export const LoanTabs = ({ onNextStep, isNextStepPending, isScanComplete }: LoanTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  /** 현재 경로 기반 활성 탭 식별 로직 (Why: UI 상태와 라우트 동기화 보장) */
  const activeTab = LOAN_PROCESS_TABS.find((tab) => location.pathname.startsWith(tab.path))?.id || '';

  return (
    <div className="flex justify-between items-center bg-white border-b border-gray-200 min-h-[32px]">
      <div className="flex h-8">
        {LOAN_PROCESS_TABS.map((tab) => {
          const isNextTarget = isScanComplete && tab.id === 'ocr';
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                'px-4 h-full text-[11px] font-bold transition-all border-r border-gray-200 relative overflow-hidden',
                activeTab === tab.id
                  ? 'bg-[#004b93] text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]'
                  : isNextTarget
                    ? 'bg-blue-50 text-[#004b93] animate-pulse border-b-2 border-b-[#004b93]'
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
            className={cn(
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
