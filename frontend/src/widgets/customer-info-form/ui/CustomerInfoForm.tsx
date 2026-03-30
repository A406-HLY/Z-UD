import { clsx } from 'clsx';
import { Card, Button } from '@/shared/ui';
import { useCustomerForm } from '@/features/customer-form/model/use-customer-form';
import { CustomerSummaryView } from './CustomerSummaryView';
import { CustomerEditFields } from './CustomerEditFields';
import { CUSTOMER_FIELDS_CONFIG } from '@/features/customer-form/model/customer-form.config';

export const CustomerInfoForm = () => {
  const {
    form,
    errors,
    successFields,
    isPollingActive,
    progressPercentage,
    handleChange,
    handleBlur,
    handleSave,
  } = useCustomerForm();

  return (
    <Card className={clsx(
      "transition-all ease-in-out rounded-none relative overflow-hidden",
      isPollingActive ? "bg-white border-l-transparent shadow-sm" : "bg-[#f8f9fa] border-l-transparent shadow-sm"
    )}>
      <div className={clsx(
        "transition-all",
        isPollingActive ? "p-3" : "p-4"
      )}>
        {isPollingActive ? (
        <CustomerSummaryView form={form} onEdit={handleSave} />
      ) : (
        <div className="flex flex-col w-full gap-y-2 animate-fade-in">
          {}
          {form.consultationId && (
            <div className="w-full mb-0.5 p-1.5 bg-slate-100 border border-slate-200 rounded-none flex justify-between items-center transition-all hover:bg-slate-200/50">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Counsel_Session_ID</span>
              <span className="text-[10px] text-slate-700 font-mono font-bold leading-none">{form.consultationId}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center w-full">
            <CustomerEditFields
              form={form}
              errors={errors}
              successFields={successFields}
              onChange={handleChange}
              onBlur={handleBlur}
              fields={CUSTOMER_FIELDS_CONFIG.slice(0, 3)}
            />
          </div>

          <div className="w-full border-t border-slate-200/50 my-0.5" />

          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center w-full">
            <CustomerEditFields
              form={form}
              errors={errors}
              successFields={successFields}
              onChange={handleChange}
              onBlur={handleBlur}
              fields={CUSTOMER_FIELDS_CONFIG.slice(3)}
            />

            <div className="ml-auto relative mt-0.5 h-8 flex items-center">
              <Button
                type="button"
                size="sm"
                disabled={progressPercentage < 100}
                className={clsx(
                  "h-8 px-6 text-[10px] font-bold transition-all duration-500 border rounded-none relative overflow-hidden active:scale-95 shadow-sm whitespace-nowrap",
                  progressPercentage === 100
                    ? "bg-[#004b93] text-white border-[#003d7a] hover:bg-[#003d7a]"
                    : "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                )}
                style={progressPercentage < 100 ? {
                  backgroundImage: `linear-gradient(to right, #f1f5f9 ${progressPercentage}%, #ffffff ${progressPercentage}%)`
                } : undefined}
                onClick={handleSave}
              >
                <span className={clsx(
                  "relative z-10",
                  progressPercentage > 50 && progressPercentage < 100 ? "text-slate-700" : ""
                )}>
                  {progressPercentage === 100 ? '스캔본 요청하기' : '스캔본 요청하기'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Card>
  );
};