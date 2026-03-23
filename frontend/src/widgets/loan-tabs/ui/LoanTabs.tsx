<<<<<<< HEAD
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LOAN_PROCESS_TABS } from '@/entities/loan-document/model/document.constants';
=======
import { clsx } from 'clsx';
import { Button } from '@/shared/ui';
import { LOAN_PROCESS_TABS, DOCUMENT_VIEWER_LABELS } from '@/entities/loan-document/model/document.constants';
>>>>>>> 3b87214 (♻️ refactor: 서류 뷰어 레이아웃 고도화 및 스캔 자동 종료 로직 구현)

interface LoanTabsProps {
  onNextStep?: () => void;
  isNextStepPending?: boolean;
  isScanComplete?: boolean; // (Why) 스캔 완료 여부에 따라 버튼 활성화 및 가이드를 제어합니다.
}

/**
 * 대출 프로세스 탭 네비게이션 위젯
 */
<<<<<<< HEAD
export const LoanTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /** 현재 경로 기반 활성 탭 식별 로직 (Why: UI 상태와 라우트 동기화 보장) */
  const activeTab = LOAN_PROCESS_TABS.find((tab) => location.pathname.startsWith(tab.path))?.id || '';

  return (
    <div className="flex border-b border-gray-200 bg-white">
      {LOAN_PROCESS_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={cn(
            'px-10 py-3 text-[11px] font-black transition-colors border-r border-gray-200 uppercase tracking-wider',
            activeTab === tab.id
              ? 'bg-[#004b93] text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]'
              : 'bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
          )}
        >
          {tab.label}
        </button>
      ))}
      {/* 탭 뒤의 빈 공간 디자인 (Why: 업무용 시스템의 밀집도 유지를 위한 시각적 처리) */}
      <div className="flex-1 bg-[#F8F9FA] border-l border-gray-300" />
=======
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
>>>>>>> 3b87214 (♻️ refactor: 서류 뷰어 레이아웃 고도화 및 스캔 자동 종료 로직 구현)
    </div>
  );
};
