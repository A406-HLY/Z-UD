import { useNavigate, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LOAN_PROCESS_TABS } from '@/entities/loan-document/model/document.constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 대출 프로세스 탭 네비게이션 위젯
 */
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
    </div>
  );
};
