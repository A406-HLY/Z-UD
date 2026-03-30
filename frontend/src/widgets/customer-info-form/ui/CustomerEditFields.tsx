import { useState } from 'react';
import { clsx } from 'clsx';
import { Input, Select, FormField } from '@/shared/ui';
import { CUSTOMER_FIELDS_CONFIG, FieldConfig } from '@/features/customer-form/model/customer-form.config';
import { Customer } from '@/entities/customer/model/types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CustomerEditFieldsProps {
  form: Customer;
  errors: Partial<Record<keyof Customer, boolean>>;
  successFields: Partial<Record<keyof Customer, boolean>>;
  onChange: (field: keyof Customer, value: string, formatType?: string) => void;
  onBlur: (field: keyof Customer) => void;
  fields?: FieldConfig[];
}

/**
 * @widget CustomerInfoForm/Sub
 * 고객 정보 수정을 위한 입력 필드 집합 컴포넌트입니다.
 * (Why) 설정 객체 기반의 선언적 렌더링(P2)을 도입하여 반복되는 코드를 제거하고 가독성을 확보합니다.
 */
export const CustomerEditFields = ({ 
  form, 
  errors, 
  successFields,
  onChange,
  onBlur,
  fields = CUSTOMER_FIELDS_CONFIG
}: CustomerEditFieldsProps) => {
  const [isShaking, setIsShaking] = useState(false);

  const handleShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };
  return (
    <>
      {fields.map((field) => (
        <FormField
          key={field.id}
          id={field.id}
          label={field.label}
          isError={errors[field.id]}
        >
          {field.component === 'input' ? (
            <div className={clsx(
              "relative flex items-center",
              field.hasStepper ? "w-fit" : "w-full"
            )}>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.id] || ''}
                isError={errors[field.id]}
                isSuccess={successFields[field.id]}
                onChange={(e) => onChange(field.id, e.target.value, field.formatType)}
                onBlur={() => onBlur(field.id)}
                onFocus={() => {
                  if (field.hasStepper && !form[field.id]) {
                    onChange(field.id, '0');
                  }
                }}
                className={clsx(
                  field.className,
                  "transition-all rounded-none h-8 !min-h-[32px] !py-0",
                  "!px-0",
                  field.hasStepper && "pr-[34px]" // 상하 화살표 공간 확보
                )}
                rightElement={
                  field.hasStepper ? (
                    <div className="flex items-center h-full pointer-events-auto mr-[-8px]">
                      {field.rightAddon && <span className="text-[10px] text-slate-400 font-bold mr-1.5">{field.rightAddon}</span>}
                      <div className="flex flex-col h-full w-[24px] bg-white border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(form[field.id] || '0', 10);
                            onChange(field.id, (current + 1).toString());
                          }}
                          className="flex-1 px-1 flex items-center justify-center border-b border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-[#004b93] active:bg-slate-100 transition-all rounded-tr-sm"
                        >
                          <ChevronUp size={12} strokeWidth={3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(form[field.id] || '0', 10);
                            if (current > 0) {
                              onChange(field.id, (current - 1).toString());
                            } else {
                              handleShake();
                            }
                          }}
                          className={clsx(
                            "flex-1 px-1 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#004b93] active:bg-slate-100 transition-all rounded-br-sm",
                            isShaking && "animate-shake bg-red-50 text-red-500 hover:bg-red-50 hover:text-red-600"
                          )}
                        >
                          <ChevronDown size={12} strokeWidth={3} className={clsx(isShaking && "text-red-500")} />
                        </button>
                      </div>
                    </div>
                  ) : field.rightAddon ? (
                    <span className="text-[9px] text-slate-400 uppercase font-bold pr-2">{field.rightAddon}</span>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <Select
              id={field.id}
              value={form[field.id] || ''}
              isError={errors[field.id]}
              isSuccess={successFields[field.id]}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(field.id, e.target.value)}
              onBlur={() => onBlur(field.id)}
              className={clsx(
                field.className,
                "pl-2 transition-all rounded-none h-8 py-0"
              )}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          )}
        </FormField>
      ))}
    </>
  );
};
