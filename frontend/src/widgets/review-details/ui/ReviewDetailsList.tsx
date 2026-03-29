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

const LIST_TEXT = {
  TITLE: "세부 심사 항목별 검증 내역",
  FILTER_ALL: "전체",
  FILTER_PASS: "통과",
  FILTER_REJECT: "거절",
  SORT_STATUS: "상태순",
  SORT_NAME: "이름순",
  EMPTY_RESULT: "조건에 맞는 항목이 없습니다.",
  BADGE_REQUIRED: "필수",
  BADGE_INFORMATIONAL: "참고",
  LABEL_VALUE: "값:",
  DEFAULT_REASON: "관리 기준 충족",
  BTN_ARTICLE: "문서 확인",
  NA: "N/A",
} as const;

const TABLE_HEADERS = {
  ITEM: "Audit Item",
  RESULT: "Result",
  VALUE_REASON: "Extracted Value & Reason",
  REFERENCE: "Reference",
} as const;

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
    <div className="bg-white border border-[#556677] shadow-sm flex flex-col h-full animate-fade-in flex-1 min-h-[600px] rounded-none">
      {/* Header & Controls */}
      <div className="bg-[#445566] text-white text-[10px] font-bold px-3 py-1.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-3 bg-blue-400"></div> {LIST_TEXT.TITLE}
        </div>
        <div className="flex gap-3 items-center">
          {/* Filter Group */}
          <div className="flex bg-[#334455] rounded-[2px] overflow-hidden border border-[#556677]">
            {(['ALL', 'PASS', 'REJECT'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={clsx(
                  "px-2 py-0.5 transition-colors text-[9px]",
                  filter === f ? "bg-blue-500 text-white font-bold" : "text-gray-300 hover:bg-[#556677]"
                )}
              >
                {f === 'ALL' ? LIST_TEXT.FILTER_ALL : f === 'PASS' ? LIST_TEXT.FILTER_PASS : LIST_TEXT.FILTER_REJECT}
              </button>
            ))}
          </div>
          {/* Sort Toggle */}
          <button 
            onClick={handleSortChange}
            className="flex items-center gap-1 bg-[#334455] border border-[#556677] px-2 py-0.5 rounded-[2px] hover:bg-[#556677] transition-colors text-[9px]"
          >
            <ArrowUpDown size={10} />
            {sort === 'PASS_STATUS' ? LIST_TEXT.SORT_STATUS : LIST_TEXT.SORT_NAME}
          </button>
        </div>
      </div>

      {/* List Body with Sticky Header */}
      <div className="flex-1 overflow-y-auto relative bg-[#f1f5f9]">
        {/* Table Header (Windows Classic Style) */}
        <div className="flex bg-[#cbd5e1] text-[#334455] font-black text-[9px] uppercase tracking-tighter border-b-2 border-[#475569] sticky top-0 z-10 shadow-sm">
          <div className="w-[22%] px-3 py-1.5 border-r border-[#94a3b8]">{TABLE_HEADERS.ITEM}</div>
          <div className="w-[10%] px-3 py-1.5 border-r border-[#94a3b8] text-center">{TABLE_HEADERS.RESULT}</div>
          <div className="flex-1 px-3 py-1.5 border-r border-[#94a3b8] bg-[#dee4ed]">{TABLE_HEADERS.VALUE_REASON}</div>
          <div className="w-[18%] px-3 py-1.5 text-center">{TABLE_HEADERS.REFERENCE}</div>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold text-[12px] bg-white border m-4 border-dashed border-slate-300">{LIST_TEXT.EMPTY_RESULT}</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className={clsx(
              "flex border-b border-[#cbd5e1] hover:bg-[#ebf0f5] transition-colors group min-h-[56px] bg-white", 
              item.result === APPROVAL_STATUS.REJECT && "bg-[#fff5f5] hover:bg-[#ffebeb]",
              item.excludedFromFinal && "opacity-75"
            )}>
              {/* 항목명 영역 */}
              <div className="w-[22%] px-3 py-2 border-r border-[#cbd5e1] flex flex-col justify-center bg-slate-50/30">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="font-black text-[#1e293b] text-[11px] leading-tight tracking-tight">{item.name_ko}</span>
                  {item.isRequired && (
                    <span className="bg-[#003366] text-white px-1.5 py-[2px] text-[8px] font-black tracking-tighter shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,0.3)] border-t border-l border-white/20">
                      {LIST_TEXT.BADGE_REQUIRED}
                    </span>
                  )}
                </div>
                <span className="text-[8.5px] text-[#94a3b8] font-mono font-bold">ID_{item.key}</span>
              </div>
              
              {/* 결과 상태 배지 영역 */}
              <div className="w-[10%] px-1 py-2 border-r border-[#cbd5e1] flex items-center justify-center">
                <span className={clsx(
                  "px-1 py-1 text-[10px] font-black uppercase text-center w-full border-2 shadow-[1px_1px_0px_white_inset]",
                  item.result === APPROVAL_STATUS.PASS ? 
                    "text-[#065f46] bg-[#d1fae5] border-[#059669]" : 
                  item.result === APPROVAL_STATUS.REJECT ? 
                    "text-[#991b1b] bg-[#fee2e2] border-[#dc2626] animate-pulse" :
                    "text-[#92400e] bg-[#fef3c7] border-[#d97706]"
                )}>
                  {item.result}
                </span>
              </div>
              
              {/* 심사 상세 사유 및 데이터 영역 (가장 중요) */}
              <div className="flex-1 px-4 py-2 border-r border-[#cbd5e1] flex flex-col justify-center gap-1.5">
                <div className={clsx(
                  "text-[11.5px] font-black leading-snug tracking-tight",
                  item.result === APPROVAL_STATUS.REJECT ? "text-[#b91c1c]" : "text-[#1e3a8a]"
                )}>
                  <span className="mr-1.5 opacity-40">▶</span>
                  {item.reason || LIST_TEXT.DEFAULT_REASON}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{LIST_TEXT.LABEL_VALUE}</span>
                  <div className="text-[9.5px] text-slate-700 font-mono bg-slate-100 px-2 py-0.5 border border-slate-200 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)]">
                    {formatValueForUI(item.value)}
                  </div>
                </div>
              </div>
              
              {/* 근거 조항 (Reference Buttons) */}
              <div className="w-[18%] px-3 py-2 flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 group-hover:bg-slate-100/80 transition-colors">
                {item.matched_articles.length > 0 ? (
                  item.matched_articles.map((art, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleArticleClick([art])}
                      className={clsx(
                        "w-full px-2 py-1 text-[9px] font-black text-[#334455] bg-[#e2e8f0] border-2 transition-all",
                        "border-t-white border-l-white border-b-[#94a3b8] border-r-[#94a3b8]",
                        "hover:bg-[#cbd5e1] active:border-t-[#94a3b8] active:border-l-[#94a3b8] active:border-b-white active:border-r-white",
                        "flex items-center gap-1.5 shadow-[inset_1px_1px_0px_white]"
                      )}
                    >
                      <FileText size={10} className="shrink-0 text-[#475569]" />
                      <span className="truncate">{art}</span>
                    </button>
                  ))
                ) : (
                  <span className="text-[9px] text-slate-300 font-mono italic">{LIST_TEXT.NA}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
