import { clsx } from 'clsx';
import { Input, Select, FormField } from '@/shared/ui';
import { CUSTOMER_FIELDS_CONFIG } from '@/features/customer-form/model/customer-form.config';
import { Customer } from '@/entities/customer/model/types';

interface CustomerEditFieldsProps {
  form: Customer;
  errors: Partial<Record<keyof Customer, boolean>>;
  firstEmptyField?: keyof Customer;
  onChange: (field: keyof Customer, value: string, formatType?: string) => void;
}

/**
 * @widget CustomerInfoForm/Sub
 * 고객 정보 수정을 위한 입력 필드 집합 컴포넌트입니다.
 * (Why) 설정 객체 기반의 선언적 렌더링(P2)을 도입하여 반복되는 코드를 제거하고 가독성을 확보합니다.
 */
export const CustomerEditFields = ({ 
  form, 
  errors, 
  firstEmptyField, 
  onChange 
}: CustomerEditFieldsProps) => {
  return (
    <>
      {CUSTOMER_FIELDS_CONFIG.map((field) => (
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
                onChange={(e) => onChange(field.id, e.target.value, field.formatType)}
                className={clsx(
                  field.className,
                  "transition-all duration-300 rounded-none",
                  firstEmptyField === field.id && "border-[#004b93] border-2 bg-blue-50/30"
                )}
              />
              {field.id === 'desiredAmount' && (
                <span className="absolute right-2 text-[9px] text-slate-400 uppercase font-bold">KRW</span>
              )}
              {field.id === 'houseCount' && (
                <span className="absolute right-1.5 text-[10px] text-slate-400">채</span>
              )}
            </div>
          ) : (
            <Select
              id={field.id}
              value={form[field.id] || ''}
              isError={errors[field.id]}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(field.id, e.target.value)}
              className={clsx(
                field.className,
                "px-2 transition-all duration-300 focus:ring-0 focus:ring-offset-0 rounded-none",
                firstEmptyField === field.id && "border-[#004b93] border-2 bg-blue-50/30"
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
