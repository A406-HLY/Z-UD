import { useState } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

import { APPROVAL_STATUS } from '@/shared/config/constants';

/**
 * @widget review-summary
 * 상태 요약 및 핵심 결과 컴포넌트
 */
export const StatusSummaryBoard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentProduct = useAppSelector(selectCurrentProduct);

  if (!currentProduct) return null;

  const rejectedItems = currentProduct.items.filter(i => i.result === APPROVAL_STATUS.REJECT);
  const hasRejects = rejectedItems.length > 0;
  
  return (
    <div className="bg-white border border-gray-300 shadow-sm rounded-none mb-4 animate-fade-in">
      {/* 1. 상단 종합 결과 */}
      <div className="px-4 py-3 bg-slate-50 border-b border-gray-200 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {currentProduct.finalResult === APPROVAL_STATUS.PASS ? (
              <span className="bg-green-100 border border-green-300 text-green-700 font-bold px-2 py-0.5 rounded-[2px] text-[10px] flex items-center gap-1 shadow-sm uppercase tracking-wider">
                <CheckCircle size={10} strokeWidth={3} /> APPROVED
              </span>
            ) : currentProduct.finalResult === APPROVAL_STATUS.REJECT ? (
              <span className="bg-red-100 border border-red-300 text-red-700 font-bold px-2 py-0.5 rounded-[2px] text-[10px] flex items-center gap-1 shadow-sm uppercase tracking-wider">
                <AlertCircle size={10} strokeWidth={3} /> REJECTED
              </span>
            ) : (
              <span className="bg-orange-100 border border-orange-300 text-orange-700 font-bold px-2 py-0.5 rounded-[2px] text-[10px] flex items-center gap-1 shadow-sm uppercase tracking-wider">
                <AlertCircle size={10} strokeWidth={3} /> REVIEW
              </span>
            )}
            <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">{currentProduct.productName} 검토 결과</h3>
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5 font-medium">자동 산출 기반 대출 가능 한도 추정액</div>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-black text-[#003366] tracking-tighter">
            {currentProduct.isApproved ? `${currentProduct.calculatedLimit.toLocaleString()} KRW` : '0 KRW'}
          </div>
          {!currentProduct.isApproved && <div className="text-[9px] text-red-500 mt-0.5 font-bold">심사 부적격으로 한도 산출 불가</div>}
        </div>
      </div>
      
      {/* 2. 거절 사유 아코디언 (가장 치명적인 1개 노출) */}
      {hasRejects && (
        <div className="bg-[#fff1f2] border-t border-red-200 transition-all">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={clsx(
              "w-full px-4 py-2 flex items-center justify-between text-[11px] text-red-800 hover:bg-red-100 transition-colors focus:outline-none",
              isExpanded && "bg-red-100 border-b border-red-200"
            )}
          >
            <div className="flex items-center gap-2 flex-1">
               <AlertCircle size={14} className="text-red-600 shrink-0" />
               <div className="font-bold text-left truncate flex-1">
                 <span className="bg-red-200 text-red-900 px-1 py-0.5 rounded-sm mr-2 text-[9px] uppercase">Summary</span>
                 {currentProduct.finalReason || (rejectedItems[0]?.reason || rejectedItems[0]?.name_ko)}
                 {rejectedItems.length > 1 && !currentProduct.finalReason && ` 외 ${rejectedItems.length - 1}건의 부적합 항목이 있습니다.`}
               </div>
            </div>
            <div className="bg-red-200 rounded-full p-0.5 text-red-700 shrink-0">
              {isExpanded ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
            </div>
          </button>
          
          {/* 아코디언 상세 목록 */}
          {isExpanded && (
            <div className="p-3 bg-red-50 space-y-2 max-h-[200px] overflow-y-auto">
              {rejectedItems.map((item, idx) => (
                <div key={idx} className="flex flex-col text-[10px] bg-white p-2.5 border border-red-200 shadow-sm relative pl-3">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                   <div className="font-black text-slate-800 mb-0.5">{item.name_ko}</div>
                   <div className="text-red-600 font-bold mb-1">{item.reason || '기준 미달'}</div>
                   <div className="text-slate-500 bg-slate-50 p-1 border border-slate-100 font-mono text-[9px]">
                     입력값: {String(item.value)} | 참조 조항: {item.matched_articles.join(', ') || 'N/A'}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
