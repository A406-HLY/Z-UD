import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

import { APPROVAL_STATUS } from '@/shared/config/constants';

const BOARD_TEXT = {
  TITLE_SUFFIX: "검토 결과",
  SUBTITLE: "자동 산출 기반 대출 가능 한도 추정액",
  LIMIT_ERROR: "심사 부적격으로 한도 산출 불가",
  SUMMARY_LABEL: "Summary",
  APPROVAL_TITLE: "Key Approval Factors",
  REVIEW_TITLE: "Manual Review Required",
  REJECT_TITLE: "Critical Failure Issues",
  DEFAULT_SUCCESS: "심사 요건을 충족합니다.",
  REJECT_COUNT_SUFFIX: (count: number) => ` 외 ${count}건의 부적합 항목이 있습니다.`,
  INPUT_VALUE: "입력값:",
  REFERENCE: "참조 조항:",
  NA: "N/A",
  CRITERIA_UNMET: "기준 미달",
} as const;

export const StatusSummaryBoard = () => {
  const currentProduct = useAppSelector(selectCurrentProduct);

  if (!currentProduct) return null;

  const rejectedItems = currentProduct.items.filter(i => i.result === APPROVAL_STATUS.REJECT);
  const hasRejects = rejectedItems.length > 0;

  return (
    <div className="bg-white border border-[#556677] shadow-sm rounded-none animate-fade-in flex flex-col">
      <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#556677] flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {currentProduct.finalResult === APPROVAL_STATUS.PASS ? (
              <span className="bg-[#e6f4ea] border border-[#ceead6] text-[#137333] font-bold px-1.5 py-0.5 rounded-[2px] text-[10px] flex items-center gap-1 shadow-sm uppercase tracking-wider">
                <CheckCircle size={10} strokeWidth={3} /> APPROVED
              </span>
            ) : currentProduct.finalResult === APPROVAL_STATUS.REJECT ? (
              <span className="bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] font-bold px-1.5 py-0.5 rounded-[2px] text-[10px] flex items-center gap-1 shadow-sm uppercase tracking-wider">
                <AlertCircle size={10} strokeWidth={3} /> REJECTED
              </span>
            ) : (
              <span className="bg-[#fef7e0] border border-[#fef0b3] text-[#b06000] font-bold px-1.5 py-0.5 rounded-[2px] text-[10px] flex items-center gap-1 shadow-sm uppercase tracking-wider">
                <AlertCircle size={10} strokeWidth={3} /> REVIEW
              </span>
            )}
            <h3 className="font-black text-sm text-[#334455] uppercase tracking-tight">{currentProduct.productName} {BOARD_TEXT.TITLE_SUFFIX}</h3>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{BOARD_TEXT.SUBTITLE}</div>
        </div>

        <div className="text-right">
          <div className="text-xl font-black text-[#003366] tracking-tighter">
            {currentProduct.isApproved ? `${currentProduct.calculatedLimit.toLocaleString()} KRW` : '0 KRW'}
          </div>
          {!currentProduct.isApproved && <div className="text-[9px] text-[#c5221f] mt-0.5 font-bold">{BOARD_TEXT.LIMIT_ERROR}</div>}
        </div>
      </div>

      {(hasRejects || currentProduct.summary.keyApprovalReasons.length > 0 || currentProduct.summary.keyReviewReasons.length > 0) && (
        <div className={clsx(
          "transition-all bg-white flex flex-col items-stretch",
          hasRejects ? "border-b-2 border-[#c5221f]" : ""
        )}>
          <div className={clsx(
            "w-full px-4 py-2 flex items-center gap-2 text-[11px] border-b border-[#e2e8f0]",
            hasRejects ? "bg-[#fce8e6] text-[#c5221f]" : "bg-slate-50 text-slate-700"
          )}>
            {hasRejects ? <AlertCircle size={14} className="shrink-0" /> : <CheckCircle size={14} className="shrink-0 text-[#137333]" />}
            <div className="font-bold flex-1 flex flex-wrap items-center gap-1.5">
              <span className={clsx(
                "px-1 py-0.5 rounded-sm text-[9px] uppercase font-black",
                hasRejects ? "bg-[#fad2cf] text-[#a50e0e]" : "bg-[#ceead6] text-[#0d652d]"
              )}>{BOARD_TEXT.SUMMARY_LABEL}</span>
              <span>{currentProduct.finalReason || (hasRejects ? rejectedItems[0]?.reason : BOARD_TEXT.DEFAULT_SUCCESS)}</span>
            </div>
          </div>

          <div className="p-2 flex flex-wrap lg:flex-nowrap gap-2 bg-white">

            <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
              {currentProduct.summary.keyApprovalReasons.length > 0 && (
                <div className="border border-[#ceead6] bg-[#f8fdf9] p-2">
                  <div className="text-[9px] font-black text-[#137333] uppercase mb-1.5 flex items-center gap-1">
                    <CheckCircle size={10} /> {BOARD_TEXT.APPROVAL_TITLE}
                  </div>
                  <ul className="space-y-0.5 ml-1">
                    {currentProduct.summary.keyApprovalReasons.map((reason, idx) => (
                      <li key={idx} className="text-[10px] text-slate-700 flex items-start gap-1 leading-tight">
                        <span className="text-[#137333] font-bold">✓</span> {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentProduct.summary.keyReviewReasons.length > 0 && (
                <div className="border border-[#fef0b3] bg-[#fffcf0] p-2">
                  <div className="text-[9px] font-black text-[#b06000] uppercase mb-1.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {BOARD_TEXT.REVIEW_TITLE}
                  </div>
                  <ul className="space-y-0.5 ml-1">
                    {currentProduct.summary.keyReviewReasons.map((reason, idx) => (
                      <li key={idx} className="text-[10px] text-slate-700 flex items-start gap-1 leading-tight">
                        <span className="text-[#b06000] font-bold">!</span> {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {hasRejects && (
              <div className="flex-[1.5] border border-[#fad2cf] bg-[#fdf5f4] p-2 min-w-[250px]">
                <div className="text-[9px] font-black text-[#c5221f] uppercase mb-1.5 flex items-center gap-1">
                  <AlertCircle size={10} /> {BOARD_TEXT.REJECT_TITLE}
                </div>
                <div className="space-y-1.5">
                  {rejectedItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col text-[10px] bg-white p-2 border border-[#fad2cf] relative pl-2 shadow-sm">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c5221f]"></div>
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="font-black text-slate-800">{item.name_ko}</span>
                        <span className="text-[#c5221f] font-bold text-[9px] bg-[#fce8e6] px-1 rounded-sm">{BOARD_TEXT.CRITERIA_UNMET}</span>
                      </div>
                      <div className="text-[#a50e0e] font-medium mb-1 truncate">{item.reason || BOARD_TEXT.CRITERIA_UNMET}</div>
                      <div className="text-slate-500 bg-slate-50 p-1 border border-slate-200 font-mono text-[9px] flex gap-2">
                        <span><strong className="text-slate-600">{BOARD_TEXT.INPUT_VALUE}</strong> {String(item.value)}</span>
                        <span><strong className="text-slate-600">{BOARD_TEXT.REFERENCE}</strong> {item.matched_articles.join(', ') || BOARD_TEXT.NA}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};