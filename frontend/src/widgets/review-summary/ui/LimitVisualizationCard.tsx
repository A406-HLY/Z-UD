import { useAppSelector } from '@/app/store/hooks';
import { selectCurrentProduct } from '@/entities/review/model/review.slice';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 프로그레스 바(ProgressBar) 서브 컴포넌트
const ProgressBar = ({ label, current, max, colorClass }: { label: string, current: number, max: number, colorClass: string }) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  const isOver = current > max;
  
  return (
    <div className="mb-3.5 pl-2">
      <div className="flex justify-between items-end mb-1.5 text-[10px] font-bold">
        <span className="text-slate-700 tracking-tight">{label}</span>
        <span className={isOver ? "text-red-600" : "text-slate-600 font-mono"}>
          {current}% / 규제 {max}% {isOver && "(초과)"}
        </span>
      </div>
      <div className="h-4 bg-slate-200 overflow-hidden flex relative border border-slate-300 shadow-inner">
        <div 
          className={cn("h-full transition-all flex items-center justify-end pr-1 text-[8px] text-white font-bold relative z-10", isOver ? "bg-red-500" : colorClass)} 
          style={{ width: `${percent}%` }}
        >
        </div>
        {/* 규제 상한 Threshold 선 */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-20" style={{ left: `100%` }}></div>
        {/* 눈금선 데코레이션 */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_24px,#000_25px)] bg-[length:25px]"></div>
      </div>
    </div>
  );
};

/**
 * @widget review-summary
 * 한도 산출 근거 시각화 컴포넌트
 */
export const LimitVisualizationCard = () => {
  const currentProduct = useAppSelector(selectCurrentProduct);

  if (!currentProduct) return null;

  // Mock param data (실제로는 currentProduct 내부 혹은 전역 상태에서 산출된 파라미터 활용)
  const params = [
    { label: "감정 평가 금액 (담보가치)", value: "500,000,000 원" },
    { label: "선순위 채권액", value: "0 원" },
    { label: "임대차 보증금", value: "0 원" },
    { label: "소액 임차 보증금 (차감 반영)", value: "37,000,000 원" }
  ];

  return (
    <div className="bg-white border border-gray-300 shadow-sm mb-4 animate-fade-in">
      <div className="bg-[#445566] text-white text-[10px] font-bold px-3 py-1 flex justify-between items-center border-b border-[#334455]">
        <div className="flex items-center gap-2 tracking-wide uppercase">
          <div className="w-1.5 h-3 bg-blue-400"></div> 한도 산출 근거 데이터 시각화
        </div>
        <span className="text-[9px] opacity-60 font-mono">SCN-VIS-LMT</span>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-6 bg-slate-50">
        <div className="flex flex-col justify-center border-r border-slate-300 pr-6">
          <ProgressBar label="LTV (담보인정 비율)" current={currentProduct.ltvLimit || 0} max={70} colorClass="bg-blue-600" />
          <ProgressBar label="DSR (총부채원리금 상환비율)" current={currentProduct.dsrLimit || 0} max={40} colorClass="bg-[#003366]" />
        </div>
        
        <div className="border border-slate-300 bg-white flex flex-col text-[10px] shadow-sm">
          {params.map((p, i) => (
            <div key={i} className="flex border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
               <div className="w-[55%] p-2 border-r border-slate-200 text-[#445566] font-bold bg-[#f1f5f9] tracking-tight">{p.label}</div>
               <div className="w-[45%] p-2 text-right font-mono font-bold text-slate-800 flex items-center justify-end">{p.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
