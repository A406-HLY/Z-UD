import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { 
  setSelectedArticle,
} from '@/entities/review/model/review.slice';
import { selectCurrentProduct } from '@/entities/review/model/review.selectors';
import { useState, useMemo } from 'react';
import { formatValueForUI } from '@/entities/review/lib/formatUtils';
import { clsx } from 'clsx';
import { FileText, ArrowUpDown } from 'lucide-react';
import { APPROVAL_STATUS } from '@/shared/config/constants';

type FilterType = 'ALL' | 'PASS' | 'REJECT';
type SortType = 'PASS_STATUS' | 'NAME';

/**
 * @widget review-details
 * 항목별 상세 심사 결과 및 컨트롤러(필터/정렬) 표시 컴포넌트
 */
export const ReviewDetailsList = () => {
  const dispatch = useAppDispatch();
  const currentProduct = useAppSelector(selectCurrentProduct);
  
  // FSD: 컴포넌트 내부에서만 쓰이는 UI 상태는 Redux(Entity)에서 분리하여 컴포넌트 자생력을 높입니다.
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [sort, setSort] = useState<SortType>('PASS_STATUS');

  // 내부 상태를 기반으로 순수 도메인 데이터(currentProduct.items)를 파생(Memoize)시킵니다.
  const items = useMemo(() => {
    if (!currentProduct) return [];

    let result = [...currentProduct.items];

    // 하단 컨트롤러 - 필터 적용
    if (filter === 'PASS') {
      result = result.filter(i => i.result === APPROVAL_STATUS.PASS || i.result === APPROVAL_STATUS.IRRELEVANT);
    } else if (filter === 'REJECT') {
      result = result.filter(i => i.result === APPROVAL_STATUS.REJECT || i.result === APPROVAL_STATUS.SUPPLEMENT);
    }

    // 하단 컨트롤러 - 정렬 적용
    if (sort === 'PASS_STATUS') {
      result.sort((a, b) => {
        const getScore = (res: string) => {
          if (res === APPROVAL_STATUS.REJECT) return 0;
          if (res === APPROVAL_STATUS.SUPPLEMENT) return 1;
          if (res === APPROVAL_STATUS.REVIEW_REQUIRED) return 2;
          return 3;
        };
        return getScore(a.result) - getScore(b.result);
      });
    } else if (sort === 'NAME') {
      result.sort((a, b) => a.name_ko.localeCompare(b.name_ko));
    }

    return result;
  }, [currentProduct, filter, sort]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleSortChange = () => {
    setSort(prev => prev === 'PASS_STATUS' ? 'NAME' : 'PASS_STATUS');
  };

  const handleArticleClick = (articles: string[]) => {
    dispatch(setSelectedArticle(articles.length > 0 ? articles : null));
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm flex flex-col h-full animate-fade-in flex-1 min-h-[300px]">
      {/* Header & Controls */}
      <div className="bg-[#445566] text-white text-[10px] font-bold px-3 py-1.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-3 bg-blue-400"></div> 세부 심사 항목별 검증 내역
        </div>
        <div className="flex gap-3 items-center">
          {/* Filter Group */}
          <div className="flex bg-[#334455] rounded-sm overflow-hidden border border-[#556677]">
            {(['ALL', 'PASS', 'REJECT'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={clsx(
                  "px-2 py-0.5 transition-colors text-[9px]",
                  filter === f ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-[#445566]"
                )}
              >
                {f === 'ALL' ? '전체' : f === 'PASS' ? '통과' : '거절'}
              </button>
            ))}
          </div>
          {/* Sort Toggle */}
          <button 
            onClick={handleSortChange}
            className="flex items-center gap-1 bg-[#334455] border border-[#556677] px-2 py-0.5 rounded-sm hover:bg-[#445566] transition-colors text-[9px]"
          >
            <ArrowUpDown size={10} />
            {sort === 'PASS_STATUS' ? '상태순' : '이름순'}
          </button>
        </div>
      </div>

      {/* List Body with Sticky Header */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Table Header (Moved inside the scrollable container and made sticky) */}
        <div className="flex bg-slate-100 text-[#445566] font-bold text-[9px] uppercase tracking-tighter border-b border-gray-300 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
          <div className="w-[30%] px-2 py-1.5 border-r border-gray-300">Audit Item</div>
          <div className="w-[15%] px-2 py-1.5 border-r border-gray-300 text-center">Result</div>
          <div className="flex-1 px-2 py-1.5 border-r border-gray-300">Extracted Value & Reason</div>
          <div className="w-[15%] px-2 py-1.5 text-center">Reference</div>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold text-[11px]">조건에 맞는 항목이 없습니다.</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className={clsx("flex border-b border-gray-200 hover:bg-slate-50 transition-colors group", item.result === APPROVAL_STATUS.REJECT && "bg-red-50/40")}>
              {/* 항목명 */}
              <div className="w-[30%] px-2 py-2 border-r border-gray-200 flex flex-col justify-center">
                <span className="font-bold text-slate-800 text-[10px]">{item.name_ko}</span>
                <span className="text-[8px] text-slate-400 font-mono mt-0.5">ID: {item.key}</span>
              </div>
              
              {/* 결과 */}
              <div className="w-[15%] px-2 py-2 border-r border-gray-200 flex items-center justify-center">
                <span className={clsx(
                  "px-2 py-0.5 text-[9px] font-black uppercase text-center w-full shadow-sm border",
                  item.result === APPROVAL_STATUS.PASS ? "text-blue-700 bg-blue-50 border-blue-200" : 
                  item.result === APPROVAL_STATUS.REJECT ? "text-red-700 bg-red-100 border-red-300" :
                  "text-orange-700 bg-orange-50 border-orange-200"
                )}>
                  {item.result}
                </span>
              </div>
              
              {/* 입력값 & 사유 */}
              <div className="flex-1 px-2 py-2 border-r border-gray-200 text-[10px] flex flex-col justify-center">
                <div className={clsx("font-medium mb-1", item.result === APPROVAL_STATUS.REJECT ? "text-red-600" : "text-slate-600")}>
                  {item.reason || '관리 기준 충족'}
                </div>
                <div className="text-[9px] text-slate-500 font-mono bg-slate-100 px-1 py-0.5 rounded-sm self-start inline-block border border-slate-200">
                  값: {formatValueForUI(item.value)}
                </div>
              </div>
              
              {/* 근거 조항 버튼 */}
              <div className="w-[15%] px-2 py-2 flex items-center justify-center relative">
                {item.matched_articles.length > 0 ? (
                  <button 
                    onClick={() => handleArticleClick(item.matched_articles)}
                    className="flex flex-col items-center justify-center gap-1 bg-[#f1f5f9] hover:bg-[#003366] text-[#445566] hover:text-white border border-slate-300 px-2 py-1.5 rounded-sm transition-colors text-[8px] font-bold w-full h-full"
                  >
                    <FileText size={12} />
                    <span>문서 확인</span>
                  </button>
                ) : (
                  <span className="text-[9px] text-slate-400 cursor-not-allowed">N/A</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
