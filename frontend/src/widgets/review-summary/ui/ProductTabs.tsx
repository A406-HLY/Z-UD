import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectProcessedProducts, selectSelectedProductKey, setSelectedProductKey } from '@/entities/review/model/review.slice';
import { clsx } from 'clsx';
import { APPROVAL_STATUS, UI_LIMITS } from '@/shared/config/constants';

/**
 * @widget review-summary
 * 상품 탭 네비게이션 컴포넌트 (최대 5개 탭 지원)
 */
export const ProductTabs = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProcessedProducts);
  const selectedTab = useAppSelector(selectSelectedProductKey);

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-[#e4ebf1] flex border-b border-gray-400 shrink-0 select-none overflow-x-auto">
      {products.slice(0, UI_LIMITS.MAX_VISIBLE_TABS).map(prod => {
        const isSelected = selectedTab === prod.productKey;
        
        // 미선택 탭 테두리 색상: 승인(초록) / 거절(빨강)
        const outlineColor = prod.isApproved ? '#22c55e' : '#ef4444';

        return (
          <button
            key={prod.productKey}
            onClick={() => dispatch(setSelectedProductKey(prod.productKey))}
            className={clsx(
              "px-5 py-2 text-[11px] font-bold uppercase transition-all shrink-0 flex items-center gap-2 relative",
              isSelected
                ? "bg-[#003366] text-white" // 선택: 파란색 배경
                : "bg-white text-slate-700 hover:bg-slate-50" // 미선택
            )}
            style={
              !isSelected
                ? {
                    borderTop: `2px solid ${outlineColor}`,
                    borderRight: '1px solid #cbd5e1',
                    borderLeft: '1px solid #cbd5e1',
                    borderBottom: '1px solid #cbd5e1',
                  }
                : {
                    border: '1px solid #003366',
                    borderBottom: 'none',
                  }
            }
          >
            <span>{prod.productName || prod.productKey}</span>
            {/* 거절 탭인 경우 경고 도트 표시 */}
            {!prod.isApproved && (
              <span className={clsx(
                "w-1.5 h-1.5 rounded-full shadow-sm",
                isSelected ? "bg-red-400" : "bg-red-500 animate-pulse"
              )}></span>
            )}
          </button>
        );
      })}
      <div className="flex-1 border-b border-gray-400"></div>
    </div>
  );
};
