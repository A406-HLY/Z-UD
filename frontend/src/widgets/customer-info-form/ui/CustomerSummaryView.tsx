import { clsx } from 'clsx';
import { Button } from '@/shared/ui';
import { REQUIRED_FIELDS, CUSTOMER_FORM_LABELS } from '@/entities/customer/model/customer.constants';
import { Customer } from '@/entities/customer/model/types';

interface CustomerSummaryViewProps {
  form: Customer;
  onEdit: () => void;
}

export const CustomerSummaryView = ({ form, onEdit }: CustomerSummaryViewProps) => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center gap-4 text-xs text-slate-700">
        {REQUIRED_FIELDS.map((field, idx) => (
          <div key={field} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-tighter">
                {CUSTOMER_FORM_LABELS[field as keyof typeof CUSTOMER_FORM_LABELS] || field}
              </span>
              <span className={clsx(
                "font-bold",
                field === 'name' || field === 'targetLoanAmount' ? "text-slate-900" : "text-slate-600 font-mono"
              )}>
                {form[field as keyof Customer] || '-'}
              </span>
              {field === 'targetLoanAmount' && <span className="text-[9px] text-slate-400 ml-0.5">원</span>}
            </div>
            {idx < REQUIRED_FIELDS.length - 1 && <div className="w-px h-2.5 bg-slate-200 ml-2" />}
          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-3 border-slate-200 text-slate-500 rounded-none hover:bg-slate-50 hover:text-slate-900 transition-colors bg-white font-bold"
          onClick={onEdit}
        >
          정보 수정
        </Button>
      </div>
    </div>
  );
};