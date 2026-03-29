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
    <div className="bg-white border border-[#556677] shadow-sm flex flex-col h-full animate-fade-in flex-1 min-h-[300px] rounded-none">
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
      <div className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
        {/* Table Header */}
        <div className="flex bg-[#e2e8f0] text-[#334455] font-black text-[9px] uppercase tracking-tighter border-b border-[#556677] sticky top-0 z-10 shadow-sm backdrop-blur-sm">
          <div className="w-[30%] px-3 py-1.5 border-r border-[#cbd5e1]">{TABLE_HEADERS.ITEM}</div>
          <div className="w-[12%] px-3 py-1.5 border-r border-[#cbd5e1] text-center">{TABLE_HEADERS.RESULT}</div>
          <div className="flex-1 px-3 py-1.5 border-r border-[#cbd5e1]">{TABLE_HEADERS.VALUE_REASON}</div>
          <div className="w-[20%] px-3 py-1.5 text-center">{TABLE_HEADERS.REFERENCE}</div>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold text-[11px] bg-white">{LIST_TEXT.EMPTY_RESULT}</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className={clsx(
              "flex border-b border-[#cbd5e1] hover:bg-[#f1f5f9] transition-colors group min-h-[48px] bg-white", 
              item.result === APPROVAL_STATUS.REJECT && "bg-[#fdf5f4] hover:bg-[#fce8e6]",
              item.excludedFromFinal && "opacity-80 grayscale-[20%]"
            )}>
              {/* 항목명 */}
              <div className="w-[30%] px-3 py-2 border-r border-[#cbd5e1] flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="font-black text-[#334455] text-[10px] leading-tight">{item.name_ko}</span>
                  {/* (New) 필수/참고 뱃지 */}
                  {item.isRequired && (
                    <span className="bg-[#003366] text-white px-1 py-[1px] rounded-[1px] text-[8px] font-black tracking-tighter shrink-0 animate-pulse">{LIST_TEXT.BADGE_REQUIRED}</span>
                  )}
                  {item.excludedFromFinal && (
                    <span className="bg-slate-200 text-slate-600 px-1 py-[1px] rounded-[1px] text-[8px] font-bold tracking-tighter shrink-0">{LIST_TEXT.BADGE_INFORMATIONAL}</span>
                  )}
                </div>
                <span className="text-[8px] text-[#94a3b8] font-mono">ID: {item.key}</span>
              </div>
              
              {/* 결과 */}
              <div className="w-[12%] px-2 py-2 border-r border-[#cbd5e1] flex items-center justify-center">
                <span className={clsx(
                  "px-2 py-0.5 text-[9px] font-black uppercase text-center w-full border rounded-[2px]",
                  item.result === APPROVAL_STATUS.PASS ? "text-[#137333] bg-[#e6f4ea] border-[#ceead6]" : 
                  item.result === APPROVAL_STATUS.REJECT ? "text-[#c5221f] bg-[#fce8e6] border-[#fad2cf]" :
                  "text-[#b06000] bg-[#fef7e0] border-[#fef0b3]"
                )}>
                  {item.result}
                </span>
              </div>
              
              {/* 입력값 & 사유 */}
              <div className="flex-1 px-3 py-2 border-r border-[#cbd5e1] text-[10px] flex flex-col justify-center">
                <div className={clsx("font-bold mb-1", item.result === APPROVAL_STATUS.REJECT ? "text-[#a50e0e]" : "text-[#475569]")}>
                  {item.reason || LIST_TEXT.DEFAULT_REASON}
                </div>
                <div className="text-[9px] text-[#64748b] font-mono bg-[#f8fafc] px-1.5 py-0.5 rounded-[2px] self-start inline-block border border-[#e2e8f0]">
                  <strong className="text-[#334455]">{LIST_TEXT.LABEL_VALUE}</strong> {formatValueForUI(item.value)}
                </div>
              </div>
              
              {/* 근거 조항 조항별 하이퍼링크 */}
              <div className="w-[20%] px-3 py-2 flex flex-col items-start justify-center gap-1 bg-[#f8fafc] group-hover:bg-[#f1f5f9] transition-colors min-w-[120px]">
                {item.matched_articles.length > 0 ? (
                  item.matched_articles.map((art, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleArticleClick([art])}
                      className="text-[#004b93] hover:text-[#003366] hover:underline text-[9px] font-bold flex items-center gap-1.5 whitespace-nowrap bg-white px-1.5 py-0.5 border border-[#cbd5e1] rounded-[2px] transition-colors w-full text-left shadow-sm hover:shadow-md hover:-translate-y-[0.5px]"
                    >
                      <FileText size={10} className="shrink-0 text-[#004b93]" />
                      <span className="truncate">{art}</span>
                    </button>
                  ))
                ) : (
                  <span className="text-[9px] text-[#94a3b8] cursor-not-allowed font-mono text-center w-full">{LIST_TEXT.NA}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
