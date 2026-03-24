import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { AuditSummaryItem } from '@/entities/audit';
import { LegacySpinner, Card } from '@/shared/ui';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuditReportSectionProps {
  item: AuditSummaryItem;
  className?: string;
}

/**
 * @widget AuditReportSection
 * (Why) B2B 실무 환경에서 화면의 흔들림(Layout Shift)을 방지하기 위해 '고정형 프레임(Fixed Height Frame)' 구조를 채택했습니다.
 * (P1) 피드백 반영: 데이터 로딩 전후의 높이를 동일하게 유지하여 전문적인 '콘솔 유저 인터페이스' 무드를 강화했습니다.
 */
export const AuditReportSection: React.FC<AuditReportSectionProps> = ({ item, className }) => {
  const isLoading = item.status === 'LOADING';
  const isError = item.status === 'ERROR';

  // (Why) 항목 종류별로 정확한 픽셀 단위 고정 높이를 주입하여 틱틱거리는 레이아웃 변화를 100% 차단합니다.
  const fixedHeights: Record<string, number> = {
    'credit-rating': 36, // 1 row = 36px
    'house-audit': 72,   // 36px * 2 rows = 72px
    'loan-history': 160, // 32px header + 32px * 3 rows + 32px footer = 160px
  };
  const exactHeight = fixedHeights[item.id] || 80;

  return (
    <Card className={cn(
      "rounded-none border border-slate-300 p-0 bg-white shadow-none overflow-hidden flex flex-col",
      className
    )}>
      {/* 섹션 헤더 - 고정 높이 36px */}
      <div className={cn(
        "px-4 h-9 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0",
        isError && "bg-red-50 border-red-200"
      )}>
        <h3 className="text-[12px] font-bold text-slate-800">
          {item.title}
        </h3>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <LegacySpinner size="sm" className="border-t-slate-500" />
          ) : (
            <div className="flex items-center gap-1">
              <span className={cn(
                "text-[10px] font-bold",
                item.status === 'SUCCESS' ? 'text-[#004b93]' : 
                item.status === 'ERROR' ? 'text-red-600' : 'text-slate-500'
              )}>
                {item.status === 'SUCCESS' ? '조회 완료' : 
                 item.status === 'ERROR' ? '조회 실패' : '조회 대기'}
              </span>
              {item.status === 'SUCCESS' ? (
                <Check size={11} className="text-[#004b93]" strokeWidth={4} />
              ) : isError ? (
                <AlertCircle size={11} className="text-red-600" strokeWidth={3} />
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* 상세 콘텐츠 영역 - 고정형 픽셀 프레임 적용 */}
      <div 
        className="bg-white overflow-hidden relative"
        style={{ height: exactHeight }}
      >
        <div className="h-full">
           {renderCategoryContent(item, isLoading)}
        </div>
      </div>
    </Card>
  );
};

function renderCategoryContent(item: AuditSummaryItem, isLoading: boolean) {
  switch (item.id) {
    case 'credit-rating':
      return <CreditDetail summary={item.summary} isLoading={isLoading} />;
    case 'house-audit':
      return <HouseAuditDetail details={item.details} isLoading={isLoading} />;
    case 'loan-history':
      return <LoanDetail isLoading={isLoading} />;
    default:
      return (
        <div className="p-4 text-slate-400 text-[11px]">
          {isLoading ? <div className="h-2 w-1/2 bg-slate-100" /> : <p>{item.summary}</p>}
        </div>
      );
  }
}

// --- B2B 스타일 상세 컴포넌트 (데이터 필드별 개별 로딩 적용) ---

const CreditDetail = ({ summary, isLoading }: { summary: string, isLoading: boolean }) => (
  <div className="flex text-[12px] h-full tabular-nums border-b border-slate-100">
    <div className="w-32 bg-slate-50/50 px-2.5 font-semibold text-slate-500 flex items-center border-r border-slate-100 uppercase tracking-tighter text-[10px]">신용 등급 조율</div>
    <div className="flex-1 px-3 flex items-center bg-white font-bold text-[#004b93] text-[13px]">
       {isLoading ? <div className="h-4 w-12 bg-slate-50 animate-pulse" /> : summary.split(' ')[0]}
    </div>
  </div>
);

const HouseAuditDetail = ({ details, isLoading }: { details: unknown, isLoading: boolean }) => {
  type HouseDetails = {
    housePrice?: { price?: number; priceType?: string };
    nearestBranch?: { currentBranchIsNearest?: boolean };
  };
  const d = (details as HouseDetails) || {}; 

  return (
    <div className="flex flex-col text-[12px] h-full tabular-nums">
      <div className="flex border-b border-slate-100 h-[36px]">
        <div className="w-32 bg-slate-50/50 px-2.5 font-semibold text-slate-500 flex items-center border-r border-slate-100">주택 시세 (KB)</div>
        <div className="flex-1 px-3 flex items-center bg-white">
          {isLoading ? (
            <div className="h-4 w-28 bg-slate-50 animate-pulse" />
          ) : (
            <span className="font-bold text-slate-900">{d.housePrice?.price?.toLocaleString()} 만원</span>
          )}
        </div>
      </div>
      <div className="flex h-[36px]">
        <div className="w-32 bg-slate-50/50 px-2.5 font-semibold text-slate-500 flex items-center border-r border-slate-100">지점 전결 여부</div>
        <div className="flex-1 px-3 flex items-center bg-white">
          {isLoading ? (
            <div className="h-4 w-24 bg-slate-50 animate-pulse" />
          ) : (
            <span className={cn("font-bold", d.nearestBranch?.currentBranchIsNearest ? "text-[#004b93]" : "text-red-600")}>
              {d.nearestBranch?.currentBranchIsNearest ? '취급 가능 (승인)' : '취급 불가 (거리 초과)'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const LoanDetail = ({ isLoading }: { isLoading: boolean }) => (
  <div className="flex flex-col h-full text-[11px] select-none">
    <table className="w-full text-left table-fixed h-full border-separate border-spacing-0">
      <thead className="bg-[#f8f9fa] border-b border-slate-200">
        <tr className="h-[32px]">
          <th className="px-3 border-b border-slate-200 font-semibold text-slate-500 w-[40%] text-[10.5px]">금융기관</th>
          <th className="px-3 border-b border-slate-200 text-right font-semibold text-slate-500 w-[40%] text-[10.5px]">대출잔액 (원)</th>
          <th className="px-3 border-b border-slate-200 text-center font-semibold text-slate-500 w-[20%] text-[10.5px]">상태</th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {(isLoading ? Array(3).fill({}) : [
           { bank: '신한은행', amount: '25,000,000', status: '정상' },
           { bank: '국민은행', amount: '12,400,000', status: '정상' },
           { bank: '농협은행', amount: '5,000,000', status: '상환' }
        ]).map((loan, idx) => (
          <tr key={idx} className="h-[32px] border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
            <td className="px-3 border-b border-slate-50 font-medium text-slate-600 truncate">
               {isLoading ? <div className="h-3 w-16 bg-slate-100/80 rounded-[1px] animate-pulse" /> : loan.bank}
            </td>
            <td className="px-3 border-b border-slate-50 text-right font-mono font-bold text-slate-900">
               {isLoading ? <div className="h-3 w-20 bg-slate-100/80 rounded-[1px] ml-auto animate-pulse" /> : loan.amount}
            </td>
            <td className="px-3 border-b border-slate-50 text-center">
               {isLoading ? (
                 <div className="h-3 w-8 bg-slate-100/80 rounded-[1px] mx-auto animate-pulse" />
               ) : (
                 <span className={cn(
                   "text-[8.5px] font-black px-1.5 py-0.5 rounded-[1px] tracking-tight",
                   loan.status === '정상' ? "bg-blue-50 text-[#004b93] border border-blue-100" : "bg-slate-50 text-slate-400 border border-slate-200"
                 )}>
                   {loan.status}
                 </span>
               )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-[#f8f9fa]/80 font-bold border-t border-slate-200">
        <tr className="h-[32px]">
          <td className="px-3 text-slate-500 text-[10.5px]">합계</td>
          <td className="px-3 text-right text-[#004b93] font-mono text-[12px]">
            {isLoading ? <div className="h-3 w-20 bg-slate-100/80 rounded-[1px] ml-auto animate-pulse" /> : '42,400,000'}
          </td>
          <td className="px-3" />
        </tr>
      </tfoot>
    </table>
  </div>
);
