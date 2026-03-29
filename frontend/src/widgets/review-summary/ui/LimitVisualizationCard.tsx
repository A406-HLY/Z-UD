import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RootState } from '@/app/store';


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 반원형 게이지(SemiCircleGauge) 컴포넌트
const SemiCircleGauge = ({ 
  current, // 신청액 기준 현재 비율 (%)
  limit,   // 규제 한도 비율 (%)
  colorClass 
}: { 
  current: number | null, 
  limit: number | null,
  colorClass: string
}) => {
  const isCalculable = current !== null && limit !== null;
  const safeCurrent = Math.min(Math.max(current ?? 0, 0), 100);
  const safeLimit = Math.min(Math.max(limit ?? 0, 0), 100);
  const isOver = safeCurrent > safeLimit;

  // Arc Calculation
  const rUpper = 46; // 외각 (한도)
  const rLower = 32; // 내각 (신청액)
  const cUpper = Math.PI * rUpper;
  const cLower = Math.PI * rLower;
  
  const offsetUpper = cUpper * (1 - safeLimit / 100);
  const offsetLower = cLower * (1 - safeCurrent / 100);

  // 색상 맵핑
  const colorMap: Record<string, string> = {
    "bg-blue-600": "#4a6bba",
    "bg-[#003366]": "#003366",
  };
  const baseColor = colorMap[colorClass] || "#003366";
  const requestColor = isOver ? "#ef4444" : baseColor;

  return (
    <div className="flex flex-row items-center justify-center gap-4 w-full">
      {/* --- 좌측 범례 (Legend) --- */}
      <div className="flex flex-col gap-2 shrink-0 border-r border-slate-100 pr-4">
        <div className="flex items-center gap-1.5 min-w-[50px]">
          <div className="w-1 h-3 bg-slate-300 rounded-[1px]"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">신청한도</span>
          <span className="text-[9px] font-mono text-slate-400 font-bold ml-auto">{isCalculable ? `${safeLimit}%` : "-"}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-[50px]">
          <div className={cn("w-1 h-3 rounded-[1px]", isOver ? "bg-red-500" : "bg-[#4a6bba]")}></div>
          <span className={cn("text-[9px] font-black uppercase tracking-tighter", isOver ? "text-red-500" : "text-slate-600")}>신청금액</span>
          <span className={cn("text-[9px] font-mono font-bold ml-auto", isOver ? "text-red-500" : "text-[#4a6bba]")}>{isCalculable ? `${safeCurrent}%` : "-"}</span>
        </div>
      </div>

      {/* --- 우측 게이지 (Gauge) --- */}
      <div className="relative w-[140px] aspect-[2/1] bg-slate-50/20 rounded-t-full border-t border-x border-slate-100/50 pt-1 px-3 overflow-hidden shrink-0">
        <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
          {/* --- 1. Upper Layer (Regulation Limit) --- */}
          <path
            d={`M ${50 - rUpper},55 A ${rUpper},${rUpper} 0 0,1 ${50 + rUpper},55`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {isCalculable && (
            <path
              d={`M ${50 - rUpper},55 A ${rUpper},${rUpper} 0 0,1 ${50 + rUpper},55`}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={cUpper}
              strokeDashoffset={offsetUpper}
              className="transition-all duration-1000 ease-out"
            />
          )}

          {/* --- 2. Lower Layer (Actual Requested Amount) --- */}
          <path
            d={`M ${50 - rLower},55 A ${rLower},${rLower} 0 0,1 ${50 + rLower},55`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {isCalculable && (
            <path
              d={`M ${50 - rLower},55 A ${rLower},${rLower} 0 0,1 ${50 + rLower},55`}
              fill="none"
              stroke={requestColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={cLower}
              strokeDashoffset={offsetLower}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        {/* --- 산정불가 오버레이 --- */}
        {!isCalculable && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/40 backdrop-blur-[1px]">
             <span className="bg-slate-700 text-white px-2 py-0.5 rounded-[1px] text-[8px] font-black tracking-widest border border-slate-600">
               산정불가
             </span>
          </div>
        )}

        <div className="absolute bottom-0 w-full text-center">
          <span className={cn(
            "text-lg font-black font-mono tracking-tighter", 
            !isCalculable ? "text-slate-400" : isOver ? "text-red-500" : "text-[#003366]"
          )}>
            {isCalculable ? `${safeCurrent}%` : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

import { REGULATION_MAX } from '@/shared/config/constants';
import { CALCULATE_LABELS } from '@/entities/review/config/constants';

/**
 * @widget review-summary
 * 한도 산출 근거 시각화 컴포넌트 (B2B 2단 레이아웃)
 */
const CARD_TEXT = {
  TITLE: "한도 산출 근거 데이터 시각화",
  CODE: "SCN-VIS-LMT-B2B",
  LTV_HEADING: "LTV 담보인정 분석",
  DSR_HEADING: "DSR 상환능력 분석",
  ARTICLE_LABEL: "적용 법적·내규 근거",
} as const;

// 파라미터 분류 정의
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

  // LTV 및 DSR 파라미터 분류
  const ltvParams = currentProduct.limitParams.filter(p => 
    LTV_PARAM_LABELS.some(label => p.label.includes(label))
  );
  const dsrParams = currentProduct.limitParams.filter(p => 
    DSR_PARAM_LABELS.some(label => p.label.includes(label))
  );

  // --- 신청액 기반 현재 LTV/DSR 계산 (Option 3) ---
  const requestedLoanAmount = parseInt(customer.targetLoanAmount?.replace(/,/g, '') || '0');
  
  // 1. LTV: (신청액 / 담보평가가) * 100
  const collateralMarketPriceStr = ltvParams.find(p => p.label.includes(CALCULATE_LABELS.MARKET_PRICE))?.value || '0';
  const collateralMarketPrice = parseInt(collateralMarketPriceStr.replace(/[^0-9]/g, '')) || 0;
  const currentLtv = collateralMarketPrice > 0 ? (requestedLoanAmount / collateralMarketPrice) * 100 : null;

  // 2. DSR: 신청액 반영된 원리금 상환액 기준 (백엔드 제공 비율 활용)
  const currentDsr = currentProduct.dsrLimit; 

  return (
    <div className="bg-white border border-slate-300 shadow-sm mb-4 shrink-0 rounded-sm overflow-hidden flex flex-col">
      {/* 카드 공통 헤더 */}
      <div className="bg-[#445566] text-white text-[10px] font-bold px-3 py-1.5 flex justify-between items-center border-b border-[#334455] shrink-0">
        <div className="flex items-center gap-2 tracking-wide uppercase">
          <div className="w-1.5 h-3 bg-blue-400"></div> {CARD_TEXT.TITLE}
        </div>
        <span className="text-[9px] opacity-60 font-mono tracking-tighter">{CARD_TEXT.CODE}</span>
      </div>
      
      <div className="p-3 grid grid-cols-2 gap-3 bg-[#f8fafc]">
        
        {/* --- LEFT COLUMN: LTV --- */}
        <div className="flex flex-col bg-white border border-slate-200 p-3 shadow-sm">
          <div className="text-[11px] font-black text-[#003366] mb-4 border-l-3 border-[#003366] pl-2 uppercase tracking-tight">
            {CARD_TEXT.LTV_HEADING}
          </div>
          
          <div className="flex justify-center mb-4">
            <SemiCircleGauge 
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

          <div className="flex-1" /> {/* ALIGNMENT SPACER */}

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

        {/* --- RIGHT COLUMN: DSR --- */}
        <div className="flex flex-col bg-white border border-slate-200 p-3 shadow-sm">
           <div className="text-[11px] font-black text-[#003366] mb-4 border-l-3 border-[#003366] pl-2 uppercase tracking-tight">
            {CARD_TEXT.DSR_HEADING}
          </div>

          <div className="flex justify-center mb-4">
            <SemiCircleGauge 
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

          <div className="flex-1" /> {/* ALIGNMENT SPACER */}

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

