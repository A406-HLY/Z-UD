import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { APPROVAL_STATUS } from '@/shared/config/constants';

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
    </div>
  );
};
