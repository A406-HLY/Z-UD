import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setSelectedProductKey } from '@/entities/review/model/review.slice';
import { selectProcessedProducts, selectSelectedProductKey } from '@/entities/review/model/review.selectors';
import { clsx } from 'clsx';
import { UI_LIMITS } from '@/shared/config/constants';

export const ProductTabs = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProcessedProducts);
  const selectedTab = useAppSelector(selectSelectedProductKey);

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-[#e4ebf1] flex border-b border-gray-400 shrink-0 select-none overflow-x-auto">
      {products.slice(0, UI_LIMITS.MAX_VISIBLE_TABS).map((prod, index) => {
        const isSelected = selectedTab === prod.productKey || (!selectedTab && index === 0);

        const outlineColor = prod.isApproved ? '#22c55e' : '#ef4444';

        return (
          <button
            key={prod.productKey}
            onClick={() => dispatch(setSelectedProductKey(prod.productKey))}
            className={clsx(
              "px-5 py-2 text-[11px] font-bold uppercase transition-all shrink-0 flex items-center gap-2 relative",
              isSelected
                ? "bg-[#003366] text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
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
          </button>
        );
      })}
      <div className="flex-1 border-b border-gray-400"></div>
    </div>
  );
};