import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RootState } from '@/app/store';


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// [LEGACY STYLE] 선형 규제 지표 바 (RegulatoryBar) 컴포넌트
const RegulatoryBar = ({ 
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
  const isOver = isCalculable && safeCurrent > safeLimit;

  // 바 색상 결정 (레거시 스타일은 선명한 빨간색 권장)
  const barColor = isOver ? "bg-red-600" : colorClass;
  
  return (
    <div className="flex flex-col w-full gap-2 p-2 bg-slate-50/50 border border-slate-200">
      {/* 상단 수치 정보 (레거시: 두껍고 명확한 정보 배분) */}
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

      {/* 바 시각화 컨테이너 (레거시: 직각 및 격자선) */}
      <div className="relative h-7 border border-slate-800 bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
        {/* 10% 단위 수직 격자선 (Grid Lines) */}
        <div className="absolute inset-0 flex justify-between pointer-events-none px-[0.1%]">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className={cn("h-full w-[1px]", i % 5 === 0 ? "bg-slate-300" : "bg-slate-100")} />
          ))}
        </div>

        {/* 현재 수치 바 (Current) */}
        {isCalculable && (
          <div 
            className={cn("absolute top-0 left-0 h-full transition-all duration-1000 ease-out border-r border-black/20", barColor)}
            style={{ width: `${safeCurrent}%` }}
          />
        )}

        {/* 규제 한도 마커 (Legacy Limit Marker) */}
        {isCalculable && (
          <div 
            className="absolute top-0 h-full w-[4px] bg-black z-10 shadow-[2px_0_4px_rgba(0,0,0,0.2)]"
            style={{ left: `calc(${safeLimit}% - 2px)` }}
          >
            {/* 리미트 레이블 (화살표가 마커를 가리키고 텍스트는 오른쪽) */}
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

        {/* 산정불가 상태 (레거시: 대각선 해시 패턴 추천되나 여기서는 오버레이) */}
        {!isCalculable && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 backdrop-blur-[1px] z-20">
             <span className="bg-slate-800 text-white px-2 py-0.5 rounded-none text-[8px] font-black tracking-widest border-2 border-slate-600 shadow-lg">
               NON-CALCULABLE
             </span>
          </div>
        )}
      </div>

      {/* 하단 눈금 수치 (레거시: 20% 단위) */}
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

