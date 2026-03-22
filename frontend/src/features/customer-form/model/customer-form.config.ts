import { CUSTOMER_FORM_LABELS, CUSTOMER_FORM_PLACEHOLDERS } from '@/entities/customer/model/customer.constants';
import { Customer } from '@/entities/customer/model/types';

export interface FieldConfig {
  id: keyof Customer;
  label: string;
  placeholder: string;
  type?: string;
  component: 'input' | 'select';
  options?: readonly string[];
  className?: string;
  formatType?: 'name' | 'personalId' | 'phoneNumber' | 'currency' | 'number';
}

/**
 * @feature customer-form
 * 고객 정보 입력 필드에 대한 선언적 설정 객체입니다.
 * (Why) 필드 추가/수정 시 JSX를 직접 건드리지 않고 설정만 변경하여 유지보수성을 확보합니다.
 */
export const CUSTOMER_FIELDS_CONFIG: FieldConfig[] = [
  {
    id: 'name',
    label: CUSTOMER_FORM_LABELS.name,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.name,
    component: 'input',
    formatType: 'name',
    className: 'h-8 w-full max-w-[80px]',
  },
  {
    id: 'personalId',
    label: CUSTOMER_FORM_LABELS.personalId,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.personalId,
    component: 'input',
    formatType: 'personalId',
    className: 'h-8 w-full max-w-[140px]',
  },
  {
    id: 'phoneNumber',
    label: CUSTOMER_FORM_LABELS.phoneNumber,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.phoneNumber,
    type: 'tel',
    component: 'input',
    formatType: 'phoneNumber',
    className: 'h-8 w-full max-w-[130px]',
  },
  {
    id: 'loanPurpose',
    label: CUSTOMER_FORM_LABELS.loanPurpose,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.loanPurpose,
    component: 'select',
    options: ['주택구입목적', '생활안정자금목적'] as const,
    className: 'h-8 w-full max-w-[200px]',
  },
  {
    id: 'employmentType',
    label: CUSTOMER_FORM_LABELS.employmentType,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.employmentType,
    component: 'select',
    options: ['직장인', '자영업자', '프리랜서'] as const,
    className: 'h-8 w-full max-w-[160px]',
  },
  {
    id: 'desiredAmount',
    label: CUSTOMER_FORM_LABELS.desiredAmount,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.desiredAmount,
    component: 'input',
    formatType: 'currency',
    className: 'h-8 w-full pr-7 text-right font-bold text-slate-900',
  },
  {
    id: 'houseCount',
    label: CUSTOMER_FORM_LABELS.houseCount,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.houseCount,
    type: 'number',
    component: 'input',
    formatType: 'number',
    className: 'h-8 w-full pr-5 text-right',
  },
];
