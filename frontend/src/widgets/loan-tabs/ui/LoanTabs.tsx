import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LOAN_PROCESS_TABS } from '@/entities/loan-document/model/document.constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @widget LoanTabs
 * 대출 프로세스 탭 네비게이션 위젯입니다.
 * (Why) 현재 진행중인 단계를 시각적으로 표시하며, 상수를 분리하여 프로세스 확장에 유연하게 대응합니다.
 */
export const LoanTabs = () => {
  const activeTab = 'docs'; // (Why) 현재는 서류제출 단계로 고정되어 있으며, 추후 라우팅 상태와 연동 가능합니다.

  return (
    <div className="flex border-b border-gray-200 bg-white">
      {LOAN_PROCESS_TABS.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            'px-6 py-3 text-sm font-semibold transition-colors border-r border-gray-200',
            activeTab === tab.id
              ? 'bg-[#004b93] text-white' // 활성 탭 (신한 블루)
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          {tab.label}
        </button>
      ))}
      <div className="flex-1 bg-[#f8f9fa] border-l border-gray-200" />
    </div>
  );
};
