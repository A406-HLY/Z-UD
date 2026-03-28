import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 반원형 게이지(SemiCircleGauge) 컴포넌트
const SemiCircleGauge = ({ 
  label, 
  current, 
  max, 
  colorClass,
  usedArticles = []
}: { 
  label: string, 
  current: number, 
  max: number, 
  colorClass: string,
  usedArticles?: string[]
}) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  const isOver = current > max;
  
  const radius = 40;
  const circumference = Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  
  const colorMap: Record<string, string> = {
    "bg-blue-600": "#2563eb",
    "bg-[#003366]": "#003366",
    "bg-red-500": "#ef4444"
  };
  const strokeColor = isOver ? colorMap["bg-red-500"] : (colorMap[colorClass] || "#2563eb");

  return (
    <div className="flex flex-col items-center justify-start relative w-[200px] mt-2 group/gauge">
      <div className="relative w-full aspect-[2/1] mb-2 shrink-0">
        <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible px-2">
          {/* Background Arc */}
          <path
            d="M 10,55 A 40,40 0 0,1 90,55"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="11"
            strokeLinecap="round"
          />
          {/* Value Arc */}
          {percent > 0 && (
            <path
              d="M 10,55 A 40,40 0 0,1 90,55"
              fill="none"
              stroke={strokeColor}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          )}
          {/* 규제 상한 Threshold 선 */}
          <line
            x1="85"
            y1="55"
            x2="95"
            y2="55"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute bottom-1 w-full text-center">
          <span className={cn("text-xl font-black font-mono tracking-tighter", isOver ? "text-red-500" : "text-slate-800")}>
            {current}%
          </span>
        </div>
      </div>
      <div className="text-center mt-3 flex flex-col gap-1.5 w-full">
        <div className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{label}</div>
        <div className="text-[9px] text-slate-600 font-bold bg-slate-200/50 px-3 py-0.5 rounded-full inline-block mx-auto">
          규제 {max}% {isOver && <span className="text-red-600 font-black ml-1 uppercase animate-pulse">! OVER</span>}
        </div>
        {/* (New) 게이지용 내규 조항 배지 */}
        {usedArticles.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mt-2 px-2">
            {usedArticles.map((art, idx) => (
              <span 
                key={idx} 
                className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded-[1px] text-[7px] font-mono border border-slate-200 shadow-sm"
              >
                {art}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { REGULATION_MAX } from '@/shared/config/constants';

// ... ( cn 유틸리티 및 ProgressBar 정의 생략 )

/**
 * @widget review-summary
 * 한도 산출 근거 시각화 컴포넌트
 */

const CARD_TEXT = {
  TITLE: "한도 산출 근거 데이터 시각화",
  CODE: "SCN-VIS-LMT",
  LTV_LABEL: "LTV (담보인정 비율)",
  DSR_LABEL: "DSR (총부채원리금 상환비율)",
} as const;

export const LimitVisualizationCard = () => {
  const currentProduct = useAppSelector(selectCurrentProduct);

  if (!currentProduct) return null;

  return (
    <div className="bg-white border border-slate-300 shadow-sm mb-4 animate-fade-in rounded-sm overflow-hidden">
      <div className="bg-[#445566] text-white text-[10px] font-bold px-3 py-1.5 flex justify-between items-center border-b border-[#334455]">
        <div className="flex items-center gap-2 tracking-wide uppercase">
          <div className="w-1.5 h-3 bg-blue-400"></div> {CARD_TEXT.TITLE}
        </div>
        <span className="text-[9px] opacity-60 font-mono tracking-tighter">{CARD_TEXT.CODE}</span>
      </div>
      
      <div className="p-6 flex flex-col gap-8 bg-white">
        {/* 상단: 게이지 영역 (가로 배치) */}
        <div className="flex flex-row justify-center gap-16 items-start">
          <SemiCircleGauge 
            label={CARD_TEXT.LTV_LABEL} 
            current={currentProduct.ltvLimit || 0} 
            max={REGULATION_MAX.LTV} 
            colorClass="bg-blue-600" 
            usedArticles={currentProduct.ltvArticles}
          />
          <SemiCircleGauge 
            label={CARD_TEXT.DSR_LABEL} 
            current={currentProduct.dsrLimit || 0} 
            max={REGULATION_MAX.DSR} 
            colorClass="bg-[#003366]" 
            usedArticles={currentProduct.dsrArticles}
          />
        </div>
        
        {/* 하단: 산출 근거 테이블 (첨부 사진 내용) */}
        <div className="border border-slate-200 bg-white flex flex-col text-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] divide-y divide-slate-200">
          {currentProduct.limitParams.map((p, i) => (
            <div key={i} className="flex hover:bg-slate-50 transition-colors group/item">
               {/* 레이블 섹션 */}
               <div className="w-[45%] p-2.5 px-4 border-r border-slate-200 text-[#445566] font-bold bg-[#f8fafc] tracking-tight flex flex-col justify-center">
                 <span>{p.label}</span>
                 {/* (New) 내규 참조 조항 배지 리스트 */}
                 {p.usedArticles && p.usedArticles.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-1.5">
                     {p.usedArticles.map((art, idx) => (
                       <span 
                         key={idx} 
                         className="bg-slate-200 text-slate-600 px-1 py-0.5 rounded-[1px] text-[8px] font-mono font-bold border border-slate-300 shadow-[0_1px_1px_rgba(0,0,0,0.02)]"
                       >
                         {art}
                       </span>
                     ))}
                   </div>
                 )}
               </div>

               {/* 값 섹션 */}
               <div className="flex-1 p-2.5 px-4 text-right font-mono font-black text-slate-800 flex items-center justify-end gap-1.5 text-[12px]">
                 {p.value}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
