import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AuditSummaryItem } from '@/entities/audit';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuditResultItemProps {
  item: AuditSummaryItem;
}

export const AuditResultItem: React.FC<AuditResultItemProps> = ({ item }) => {
  const isSuccess = item.status === 'SUCCESS';
  const isError = item.status === 'ERROR';

  return (
    <div className={cn(
      "flex items-center justify-between p-8 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors",
      isSuccess ? "border-l-4 border-l-[#004b93]" : "border-l-4 border-l-slate-200"
    )}>
      <div className="space-y-2">
        <h4 className="text-[16px] font-bold text-slate-900 tracking-tight">
          {item.title}
        </h4>
        <div className="flex items-center gap-3">
          <p className="text-[14px] text-slate-500 font-medium">
            {item.summary}
          </p>
          {isError && (
            <span className="flex items-center gap-1.5 text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 border border-red-100 uppercase">
              <AlertCircle size={12} strokeWidth={2.5} />
              Review Required
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 ml-10">
        {item.actionLabel ? (
          <button className="h-10 px-6 text-[13px] font-extrabold text-[#004b93] border-2 border-[#004b93] bg-white hover:bg-[#004b93] hover:text-white transition-all rounded-none shadow-sm active:scale-95 uppercase tracking-tighter">
            {item.actionLabel}
          </button>
        ) : (
          <div className={cn(
            "flex items-center gap-2 px-5 py-2 font-black text-[13px] uppercase tracking-widest bg-opacity-10",
            isSuccess ? "bg-blue-50 text-[#004b93]" : "bg-gray-50 text-gray-400"
          )}>
            {isSuccess && <Check size={16} strokeWidth={3} />}
            <span>{isSuccess ? 'Completed' : 'Pending'}</span>
          </div>
        )}
      </div>
    </div>
  );
};