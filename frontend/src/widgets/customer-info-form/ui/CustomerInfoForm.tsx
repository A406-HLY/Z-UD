import { clsx } from 'clsx';
import { Card, Button } from '@/shared/ui';
import { useCustomerForm } from '@/features/customer-form/model/use-customer-form';
import { CustomerSummaryView } from './CustomerSummaryView';
import { CustomerEditFields } from './CustomerEditFields';
import { CUSTOMER_FIELDS_CONFIG } from '@/features/customer-form/model/customer-form.config';

/**
 * @widget CustomerInfoForm
 * 고객의 기초 정보를 입력받는 폼 위젯입니다.
 * (Why) PR 리뷰 피드백(P1~P3)을 반영하여 UI와 비즈니스 로직을 분리하고, 
 * 유지보수가 용이한 선언적 구조로 리팩토링되었습니다.
 */
export const CustomerInfoForm = () => {
  // (P1) 로직 분리: 모든 상태와 핸들러를 커스텀 훅으로 추출
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
        // (P3) 컴포넌트 분리: 요약 모드 전용 뷰
        <CustomerSummaryView form={form} onEdit={handleSave} />
      ) : (
        <div className="flex flex-col w-full gap-y-2 animate-fade-in">
          {/** (Why) 1920x1080 해상도 최적화를 위한 초소형 레이아웃 유지 */}
          {/* 상담 ID 표시 */}
          {form.consultationId && (
            <div className="w-full mb-0.5 p-1.5 bg-slate-100 border border-slate-200 rounded-none flex justify-between items-center transition-all hover:bg-slate-200/50">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Counsel_Session_ID</span>
              <span className="text-[10px] text-slate-700 font-mono font-bold leading-none">{form.consultationId}</span>
            </div>
          )}

          {/* Row 1: 인적 사항 (이름, 주민번호, 전화번호) */}
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

          {/* Separator Line */}
          <div className="w-full border-t border-slate-200/50 my-0.5" />

          {/* Row 2: 대출 정보 및 기타 */}
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
