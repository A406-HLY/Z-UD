import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { id: 'docs', label: '서류제출' },
  { id: 'result', label: '검증결과' },
  { id: 'myData', label: '마이데이터' },
  { id: 'report', label: '리포트' },
];

/**
 * 대출 프로세스 탭 네비게이션 위젯
 */
export const LoanTabs = () => {
  const activeTab = 'docs'; // 현재는 고정, 추후 상태 관리 연동 가능

  return (
    <div className="flex border-b border-gray-200 bg-white">
      {TABS.map((tab) => (
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
