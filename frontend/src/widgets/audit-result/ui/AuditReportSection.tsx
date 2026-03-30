import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { AuditSummaryItem, MyDataResDto } from '@/entities/audit';
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

export const AuditReportSection: React.FC<AuditReportSectionProps> = ({ item, className }) => {
  const isLoading = item.status === 'LOADING';
  const isError = item.status === 'ERROR';

  const fixedHeights: Record<string, number> = {
    'credit-rating': 36,
    'house-audit': 72,
    'loan-history': 160,
  };
  const exactHeight = fixedHeights[item.id] || 80;

  return (
    <Card className={cn(
      "rounded-none border border-slate-300 p-0 bg-white shadow-none overflow-hidden flex flex-col",
      className
    )}>
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
      return <CreditDetail details={item.details} isLoading={isLoading} />;
    case 'house-audit':
      return <HouseAuditDetail details={item.details} isLoading={isLoading} />;
    case 'loan-history':
      return <LoanDetail details={item.details} isLoading={isLoading} />;
    default:
      return (
        <div className="p-4 text-slate-400 text-[11px]">
          {isLoading ? <div className="h-2 w-1/2 bg-slate-100" /> : <p>{item.summary}</p>}
        </div>
      );
  }
}

const CreditDetail = ({ details, isLoading }: { details: unknown, isLoading: boolean }) => {
  const d = details as { ratingName?: string };
  return (
    <div className="flex text-[12px] h-full tabular-nums border-b border-slate-100">
      <div className="w-32 bg-slate-50/50 px-2.5 font-semibold text-slate-500 flex items-center border-r border-slate-100 uppercase tracking-tighter text-[10px]">신용 등급 조율</div>
      <div className="flex-1 px-3 flex items-center bg-white font-bold text-[#004b93] text-[13px]">
        {isLoading ? <div className="h-4 w-12 bg-slate-50 animate-pulse" /> : (d?.ratingName || '-')}
      </div>
    </div>
  );
};

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

const LoanDetail = ({ details, isLoading }: { details: unknown; isLoading: boolean }) => {
  const d = (details as MyDataResDto) || {};
  const products = d?.loanProducts || [];

  const displayProducts = isLoading ? Array(3).fill(null) : products.slice(0, 3);

  return (
    <div className="flex flex-col h-full text-[11px] select-none">
      <table className="w-full text-left table-fixed h-full border-separate border-spacing-0">
        <thead className="bg-[#f8f9fa] border-b border-slate-200">
          <tr className="h-[32px]">
            <th className="px-3 border-b border-slate-200 font-semibold text-slate-500 w-[40%] text-[10.5px]">계좌명/번호</th>
            <th className="px-3 border-b border-slate-200 text-right font-semibold text-slate-500 w-[40%] text-[10.5px]">대출잔액 (원)</th>
            <th className="px-3 border-b border-slate-200 text-center font-semibold text-slate-500 w-[20%] text-[10.5px]">연상환액</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {displayProducts.map((loan, idx) => (
            <tr key={idx} className="h-[32px] border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
              <td className="px-3 border-b border-slate-50 font-medium text-slate-600 truncate">
                {isLoading ? (
                  <div className="h-3 w-16 bg-slate-100/80 rounded-[1px] animate-pulse" />
                ) : (
                  <div className="flex flex-col leading-tight">
                    <span className="truncate">{loan?.accountName}</span>
                    <span className="text-[9px] opacity-60 truncate font-mono">{loan?.accountNo}</span>
                  </div>
                )}
              </td>
              <td className="px-3 border-b border-slate-50 text-right font-mono font-bold text-slate-900">
                {isLoading ? (
                  <div className="h-3 w-20 bg-slate-100/80 rounded-[1px] ml-auto animate-pulse" />
                ) : (
                  loan?.remainingLoanBalance?.toLocaleString()
                )}
              </td>
              <td className="px-3 border-b border-slate-50 text-center font-mono text-[10px] text-slate-600">
                {isLoading ? (
                  <div className="h-3 w-8 bg-slate-100/80 rounded-[1px] mx-auto animate-pulse" />
                ) : (
                  loan?.annualPrincipalAndInterestRepayment?.toLocaleString()
                )}
              </td>
            </tr>
          ))}
          {}
          {!isLoading && displayProducts.length < 3 && Array(3 - displayProducts.length).fill(null).map((_, i) => (
             <tr key={`empty-${i}`} className="h-[32px] border-b border-slate-50"><td colSpan={3} /></tr>
          ))}
        </tbody>
        <tfoot className="bg-[#f8f9fa]/80 font-bold border-t border-slate-200">
          <tr className="h-[32px]">
            <td className="px-3 text-slate-500 text-[10.5px]">남은 잔액 합계</td>
            <td className="px-3 text-right text-[#004b93] font-mono text-[12px]">
              {isLoading ? (
                <div className="h-3 w-20 bg-slate-100/80 rounded-[1px] ml-auto animate-pulse" />
              ) : (
                d?.totalRemainingLoanBalance?.toLocaleString() || '0'
              )}
            </td>
            <td className="px-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};