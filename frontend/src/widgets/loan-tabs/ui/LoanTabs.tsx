import { useNavigate, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 
 * @widget loan-tabs/constants
 * 가이드라인 기반의 4단계 업무 프로세스 정의
 */
const TABS = [
  { id: 'basic', label: '고객정보/서류', path: '/basic-info' },
  { id: 'ocr', label: '문서OCR검토', path: '/verification-result' },
  { id: 'data', label: '기초정보입력', path: '/customer-info' },
  { id: 'report', label: '심사레포트', path: '/review-report' },
];

/**
 * @widget loan-tabs
 * 대출 심사 프로세스 간 네비게이션을 담당하는 컴포넌트입니다.
 */
export const LoanTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /** 현재 경로 기반 활성 탭 식별 로직 (Why: UI 상태와 라우트 동기화 보장) */
  const activeTab = TABS.find((tab) => location.pathname.startsWith(tab.path))?.id || '';

  return (
    <div className="flex border-b border-gray-300 bg-white shrink-0">
      {TABS.map((tab) => (
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
