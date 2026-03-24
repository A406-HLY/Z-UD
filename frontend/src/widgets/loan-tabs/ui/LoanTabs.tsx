import { useNavigate, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/shared/ui';
import { LOAN_PROCESS_TABS } from '@/entities/loan-document/model/document.constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoanTabsProps {
  // (Why) 특정 페이지(심사 대시보드 등)에서 네비게이션바의 액션 버튼을 커스터마이징하기 위해 추가되었습니다.
  actionButton?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
  };
  onNextStep?: () => void;
  isNextStepPending?: boolean;
  isScanComplete?: boolean;
}

/**
 * @widget LoanTabs
 * 대출 프로세스 탭 네비게이션 위젯입니다.
 * (P1) 피드백 반영: 우측 고정 위치에 심사 상태에 따른 동적 액션 버튼을 렌더링할 수 있도록 확장되었습니다.
 */
export const LoanTabs = ({ actionButton, onNextStep, isNextStepPending, isScanComplete }: LoanTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  /** 현재 경로 기반 활성 탭 식별 로직 */
  const activeTab = LOAN_PROCESS_TABS.find((tab) => location.pathname.startsWith(tab.path))?.id || '';

  return (
    <div className="flex justify-between items-center bg-white border-b border-gray-200 min-h-[32px] sticky top-0 z-10">
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
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="px-2 flex items-center gap-2">
        {/* (Why) 사용자가 지정한 고정 위치(네비게이션바 맨 우측)의 메인 액션 버튼 */}
        {actionButton ? (
          <Button 
            size="sm" 
            className={cn(
              "h-6 text-[10px] px-4 font-black transition-all rounded-none border shadow-sm uppercase italic tracking-tighter",
              actionButton.className
            )}
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
          >
            {actionButton.label}
          </Button>
        ) : onNextStep && (
          <Button 
            size="sm" 
            variant="primary"
            className={cn(
              "h-6 text-[10px] px-4 font-bold transition-all duration-500",
              isScanComplete ? "bg-[#004b93]" : "bg-gray-200 text-gray-400 border-gray-100"
            )}
            onClick={onNextStep}
            disabled={isNextStepPending || !isScanComplete}
            isLoading={isNextStepPending}
          >
            {isNextStepPending ? '업로드 중...' : '다음 단계'}
          </Button>
        )}
      </div>
    </div>
  );
};
