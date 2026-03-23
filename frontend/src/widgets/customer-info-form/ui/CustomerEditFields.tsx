import { useState } from 'react';
import { clsx } from 'clsx';
import { Input, Select, FormField } from '@/shared/ui';
import { CUSTOMER_FIELDS_CONFIG, FieldConfig } from '@/features/customer-form/model/customer-form.config';
import { Customer } from '@/entities/customer/model/types';
import { Plus, Minus } from 'lucide-react';

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
            <div className="relative flex items-center w-full">
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.id] || ''}
                isError={errors[field.id]}
                isSuccess={successFields[field.id]}
                onChange={(e) => onChange(field.id, e.target.value, field.formatType)}
                onBlur={() => onBlur(field.id)}
                className={clsx(
                  "transition-all rounded-none h-8 !min-h-[32px] !py-0",
                  "!px-0",
                  field.id === 'houseCount' && "pr-16" // 버튼 공간 확보
                )}
                rightElement={field.id === 'desiredAmount' ? (
                  <span className="text-[9px] text-slate-400 uppercase font-bold pr-2">KRW</span>
                ) : undefined}
              />
              {field.id === 'houseCount' && (
                <div className="absolute right-0 flex items-center h-full pr-1 gap-0.5 pointer-events-auto">
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
                      "h-[18px] w-[18px] flex items-center justify-center bg-white border border-slate-300 text-slate-500 transition-all group rounded-none",
                      isShaking && "animate-shake border-red-400 text-red-500"
                    )}
                  >
                    <Minus size={10} strokeWidth={4} className="group-active:scale-75 transition-transform" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(form[field.id] || '0', 10);
                      onChange(field.id, (current + 1).toString());
                    }}
                    className="h-[18px] w-[18px] flex items-center justify-center bg-white border border-slate-300 text-slate-500 transition-all group rounded-none"
                  >
                    <Plus size={10} strokeWidth={4} className="group-active:scale-75 transition-transform" />
                  </button>
                  <span className="ml-1 text-[10px] text-slate-400 font-bold">채</span>
                </div>
              )}
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
