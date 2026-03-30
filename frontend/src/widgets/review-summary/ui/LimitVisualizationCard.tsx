import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RootState } from '@/app/store';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RegulatoryBar = ({
  current,
  limit,
  colorClass
}: {
  current: number | null,
  limit: number | null,
  colorClass: string
}) => {
  const isCalculable = current !== null && limit !== null;
  const safeCurrent = Math.min(Math.max(current ?? 0, 0), 100);
  const safeLimit = Math.min(Math.max(limit ?? 0, 0), 100);
  const isOver = isCalculable && safeCurrent > safeLimit;

  const barColor = isOver ? "bg-red-600" : colorClass;

  return (
    <div className="flex flex-col w-full gap-2 p-2 bg-slate-50/50 border border-slate-200">
      <div className="flex justify-between items-end px-0.5 border-b border-slate-100 pb-1.5 mb-1">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Regulatory Limit</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono tracking-tighter leading-none text-slate-800">
              {isCalculable ? `${safeLimit}%` : "-"}
            </span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Application Ratio</span>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-base font-black font-mono tracking-tighter leading-none",
              !isCalculable ? "text-slate-300" : isOver ? "text-red-600" : "text-[#003366]"
            )}>
              {isCalculable ? `${safeCurrent}%` : "---%"}
            </span>
            {isOver && (
              <span className="text-[7px] font-black text-red-600 bg-red-50 px-1 border border-red-200 uppercase animate-pulse">OVER</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative h-7 border border-slate-800 bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 flex justify-between pointer-events-none px-[0.1%]">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className={cn("h-full w-[1px]", i % 5 === 0 ? "bg-slate-300" : "bg-slate-100")} />
          ))}
        </div>

        {isCalculable && (
          <div
            className={cn("absolute top-0 left-0 h-full transition-all duration-1000 ease-out border-r border-black/20", barColor)}
            style={{ width: `${safeCurrent}%` }}
          />
        )}

        {isCalculable && (
          <div
            className="absolute top-0 h-full w-[4px] bg-black z-10 shadow-[2px_0_4px_rgba(0,0,0,0.2)]"
            style={{ left: `calc(${safeLimit}% - 2px)` }}
          >
            <div className="absolute -top-4 left-0 flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[7px] font-black text-black w-1 text-center">▼</span>
              <span className="text-[7px] font-black text-black tracking-tighter">LIMIT</span>
            </div>
            <div className="absolute -bottom-4 left-0 flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[7px] font-black text-black w-1 text-center">▲</span>
              <span className="text-[7px] font-black text-black tracking-tighter">{safeLimit}%</span>
            </div>
          </div>
        )}

        {!isCalculable && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 backdrop-blur-[1px] z-20">
             <span className="bg-slate-800 text-white px-2 py-0.5 rounded-none text-[8px] font-black tracking-widest border-2 border-slate-600 shadow-lg">
               NON-CALCULABLE
             </span>
          </div>
        )}
      </div>

      <div className="flex justify-between text-[7px] font-black font-mono text-slate-500 px-0.5 mt-4 opacity-80">
        {[0, 20, 40, 60, 80, 100].map(val => (
          <span key={val}>{val}%</span>
        ))}
      </div>
    </div>
  );
};

import { REGULATION_MAX } from '@/shared/config/constants';
import { CALCULATE_LABELS } from '@/entities/review/config/constants';

const CARD_TEXT = {
  TITLE: "한도 산출 근거 데이터 시각화",
  CODE: "SCN-VIS-LMT-B2B",
  LTV_HEADING: "LTV 담보인정 분석",
  DSR_HEADING: "DSR 상환능력 분석",
  ARTICLE_LABEL: "적용 법적·내규 근거",
} as const;

const LTV_PARAM_LABELS = [
  CALCULATE_LABELS.MARKET_PRICE,
  CALCULATE_LABELS.MAX_CLAIM_AMOUNT,
  CALCULATE_LABELS.REMAINING_BALANCE,
  CALCULATE_LABELS.APPLIED_LTV,
  CALCULATE_LABELS.REGULATION_REGION,
];

const DSR_PARAM_LABELS = [
  CALCULATE_LABELS.ANNUAL_INCOME,
  CALCULATE_LABELS.ANNUAL_REPAYMENT,
  CALCULATE_LABELS.APPLIED_DSR,
];

export const LimitVisualizationCard = () => {
  const currentProduct = useAppSelector(selectCurrentProduct);
  const customer = useAppSelector((state: RootState) => state.customer.data);

  if (!currentProduct) return null;

  const ltvParams = currentProduct.limitParams.filter(p =>
    LTV_PARAM_LABELS.some(label => p.label.includes(label))
  );
  const dsrParams = currentProduct.limitParams.filter(p =>
    DSR_PARAM_LABELS.some(label => p.label.includes(label))
  );

  const requestedLoanAmount = parseInt(customer.targetLoanAmount?.replace(/,/g, '') || '0');

  const collateralMarketPriceStr = ltvParams.find(p => p.label.includes(CALCULATE_LABELS.MARKET_PRICE))?.value || '0';
  const collateralMarketPrice = parseInt(collateralMarketPriceStr.replace(/[^0-9]/g, '')) || 0;
  const currentLtv = collateralMarketPrice > 0 ? (requestedLoanAmount / collateralMarketPrice) * 100 : null;

  const currentDsr = currentProduct.dsrLimit;

  return (
    <div className="bg-white border border-slate-300 shadow-sm mb-4 shrink-0 rounded-sm overflow-hidden flex flex-col">
      <div className="bg-[#445566] text-white text-[10px] font-bold px-3 py-1.5 flex justify-between items-center border-b border-[#334455] shrink-0">
        <div className="flex items-center gap-2 tracking-wide uppercase">
          <div className="w-1.5 h-3 bg-blue-400"></div> {CARD_TEXT.TITLE}
        </div>
        <span className="text-[9px] opacity-60 font-mono tracking-tighter">{CARD_TEXT.CODE}</span>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3 bg-[#f8fafc]">

        <div className="flex flex-col bg-white border border-slate-200 p-3 shadow-sm">
          <div className="text-[11px] font-black text-[#003366] mb-4 border-l-3 border-[#003366] pl-2 uppercase tracking-tight">
            {CARD_TEXT.LTV_HEADING}
          </div>

          <div className="flex justify-center mb-2">
            <RegulatoryBar
              current={currentLtv !== null ? Math.round(currentLtv) : null}
              limit={currentProduct.ltvLimit}
              colorClass="bg-blue-600"
            />
          </div>

          <div className="border border-slate-200 divide-y divide-slate-100 rounded-sm">
            {ltvParams.map((p, i) => (
              <div key={i} className="flex hover:bg-slate-50 transition-colors text-[10px]">
                <div className="w-[48%] py-1 px-2 bg-slate-50/50 border-r border-slate-200 text-slate-500 font-bold tracking-tighter">{p.label}</div>
                <div className="flex-1 py-1 px-2 text-right font-mono font-bold text-slate-800 tracking-tight">{p.value}</div>
              </div>
            ))}
          </div>

          <div className="flex-1" /> {}

          <div className="mt-4 pt-2 border-t border-slate-100">
            <div className="text-[8px] font-black text-slate-300 uppercase mb-1.5 tracking-widest">{CARD_TEXT.ARTICLE_LABEL}</div>
            <div className="flex flex-wrap gap-1">
              {currentProduct.ltvArticles.length > 0 ? (
                currentProduct.ltvArticles.map((art, idx) => (
                  <span key={idx} className="bg-slate-50 text-slate-400 px-1 py-0.5 rounded-[1px] text-[7px] font-mono border border-slate-200">{art}</span>
                ))
              ) : (
                <span className="text-slate-200 text-[8px] italic">N/A</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-white border border-slate-200 p-3 shadow-sm">
           <div className="text-[11px] font-black text-[#003366] mb-4 border-l-3 border-[#003366] pl-2 uppercase tracking-tight">
            {CARD_TEXT.DSR_HEADING}
          </div>

          <div className="flex justify-center mb-2">
            <RegulatoryBar
              current={currentDsr}
              limit={REGULATION_MAX.DSR}
              colorClass="bg-[#003366]"
            />
          </div>

          <div className="border border-slate-200 divide-y divide-slate-100 rounded-sm">
            {dsrParams.map((p, i) => (
              <div key={i} className="flex hover:bg-slate-50 transition-colors text-[10px]">
                <div className="w-[48%] py-1 px-2 bg-slate-50/50 border-r border-slate-200 text-slate-500 font-bold tracking-tighter">{p.label}</div>
                <div className="flex-1 py-1 px-2 text-right font-mono font-bold text-slate-800 tracking-tight">{p.value}</div>
              </div>
            ))}
          </div>

          <div className="flex-1" /> {}

          <div className="mt-4 pt-2 border-t border-slate-100">
            <div className="text-[8px] font-black text-slate-300 uppercase mb-1.5 tracking-widest">{CARD_TEXT.ARTICLE_LABEL}</div>
            <div className="flex flex-wrap gap-1">
              {currentProduct.dsrArticles.length > 0 ? (
                currentProduct.dsrArticles.map((art, idx) => (
                  <span key={idx} className="bg-slate-50 text-slate-400 px-1 py-0.5 rounded-[1px] text-[7px] font-mono border border-slate-200">{art}</span>
                ))
              ) : (
                <span className="text-slate-200 text-[8px] italic">N/A</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};