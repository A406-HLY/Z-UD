import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { APPROVAL_STATUS } from '@/shared/config/constants';
import { clsx } from 'clsx';
/**
 * @widget review-summary
 * 상태 요약 및 핵심 결과 컴포넌트
 */

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
  return (
    <div className="bg-white border border-[#556677] shadow-sm rounded-none animate-fade-in flex flex-col">
      {/* 1. 상단 종합 결과 */}
      <div className="px-4 py-2.5 bg-[#f8fafc] border-b-2 border-[#556677] flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {currentProduct.finalResult === APPROVAL_STATUS.PASS ? (
              <span className="bg-[#d1fae5] border-2 border-[#059669] text-[#065f46] font-black px-1.5 py-0.5 rounded-[1px] text-[10px] flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] uppercase tracking-wider">
                <CheckCircle size={10} strokeWidth={3} /> APPROVED
              </span>
            ) : currentProduct.finalResult === APPROVAL_STATUS.REJECT ? (
              <span className="bg-[#fee2e2] border-2 border-[#dc2626] text-[#991b1b] font-black px-1.5 py-0.5 rounded-[1px] text-[10px] flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] uppercase tracking-wider animate-pulse">
                <AlertCircle size={10} strokeWidth={3} /> REJECTED
              </span>
            ) : (
              <span className="bg-[#fef3c7] border-2 border-[#d97706] text-[#92400e] font-black px-1.5 py-0.5 rounded-[1px] text-[10px] flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] uppercase tracking-wider">
                <AlertCircle size={10} strokeWidth={3} /> REVIEW
              </span>
            )}
            <h3 className="font-black text-sm text-[#1e293b] uppercase tracking-tighter">{currentProduct.productName} {BOARD_TEXT.TITLE_SUFFIX}</h3>
          </div>
          <p className="text-[10.5px] font-black text-[#1e3a8a] mt-1 tracking-tight leading-relaxed max-w-[500px]">
             {currentProduct.finalReason || BOARD_TEXT.DEFAULT_SUCCESS}
          </p>
        </div>
        
        <div className="text-right bg-white p-2 border-2 border-t-[#94a3b8] border-l-[#94a3b8] border-b-white border-r-white shadow-[inset_1px_1px_4px_rgba(0,0,0,0.1)]">
          <div className="text-[9px] text-slate-500 font-black uppercase mb-0.5">{BOARD_TEXT.LIMIT_ERROR.includes('불가') && !currentProduct.isApproved ? "Error" : "Calculated Limit"}</div>
          <div className={clsx(
            "text-2xl font-black font-mono tracking-tighter leading-none",
            currentProduct.isApproved ? "text-[#003366]" : "text-[#c5221f]"
          )}>
            {currentProduct.isApproved ? `${currentProduct.calculatedLimit.toLocaleString()} KRW` : '0 KRW'}
          </div>
        </div>
      </div>

      {/* 2. 상세 검토 코멘트 영역 (Key Factors) */}
      <div className="p-3 grid grid-cols-2 gap-4 bg-[#f1f5f9]">
        {/* 승인 사유 */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[9px] text-[#003366] font-black uppercase flex items-center gap-1.5 mb-0.5 opacity-60">
            <div className="w-2 h-2 bg-[#003366]"></div> {BOARD_TEXT.APPROVAL_TITLE}
          </div>
          <div className="flex flex-col gap-1">
            {currentProduct.summary.keyApprovalReasons.length > 0 ? (
              currentProduct.summary.keyApprovalReasons.map((reason, i) => (
                <div key={i} className="text-[10px] text-slate-600 font-black tracking-tight leading-tight flex items-start gap-1">
                  <span className="text-blue-500 shrink-0">✔</span> {reason}
                </div>
              ))
            ) : (
              <div className="text-[9.5px] text-slate-400 font-bold italic">{BOARD_TEXT.NA}</div>
            )}
          </div>
        </div>

        {/* 반려/검토 사유 */}
        <div className="flex flex-col gap-1.5 border-l border-slate-300 pl-4">
          <div className={clsx(
            "text-[9px] font-black uppercase flex items-center gap-1.5 mb-0.5 opacity-60",
            currentProduct.summary.keyRejectReasons.length > 0 ? "text-[#c5221f]" : "text-[#b06000]"
          )}>
            <div className={clsx("w-2 h-2", currentProduct.summary.keyRejectReasons.length > 0 ? "bg-[#c5221f]" : "bg-[#b06000]")}></div>
            {currentProduct.summary.keyRejectReasons.length > 0 ? BOARD_TEXT.REJECT_TITLE : BOARD_TEXT.REVIEW_TITLE}
          </div>
          <div className="flex flex-col gap-1">
            {currentProduct.summary.keyRejectReasons.length > 0 ? (
              currentProduct.summary.keyRejectReasons.map((reason, i) => (
                <div key={i} className="text-[10px] text-[#c5221f] font-black tracking-tight leading-tight flex items-start gap-1">
                  <span className="shrink-0">✖</span> {reason}
                </div>
              ))
            ) : currentProduct.summary.keyReviewReasons.length > 0 ? (
              currentProduct.summary.keyReviewReasons.map((reason, i) => (
                <div key={i} className="text-[10px] text-[#b06000] font-black tracking-tight leading-tight flex items-start gap-1">
                  <span className="shrink-0">⚠</span> {reason}
                </div>
              ))
            ) : (
              <div className="text-[9.5px] text-slate-400 font-bold italic">{BOARD_TEXT.NA}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
