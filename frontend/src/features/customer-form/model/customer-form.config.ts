import { CUSTOMER_FORM_LABELS, CUSTOMER_FORM_PLACEHOLDERS, EMPLOYMENT_TYPES, LOAN_PURPOSE_OPTIONS } from '@/entities/customer/model/customer.constants';
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
  rightAddon?: string;
  hasStepper?: boolean;
}

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
    id: 'residentRegistrationNumber',
    label: CUSTOMER_FORM_LABELS.residentRegistrationNumber,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.residentRegistrationNumber,
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
    options: LOAN_PURPOSE_OPTIONS,
    className: 'h-8 w-full max-w-[200px]',
  },
  {
    id: 'employmentType',
    label: CUSTOMER_FORM_LABELS.employmentType,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.employmentType,
    component: 'select',
    options: EMPLOYMENT_TYPES,
    className: 'h-8 w-full max-w-[160px]',
  },
  {
    id: 'targetLoanAmount',
    label: CUSTOMER_FORM_LABELS.targetLoanAmount,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.targetLoanAmount,
    component: 'input',
    formatType: 'currency',
    rightAddon: 'KRW',
    className: 'h-8 w-full pr-7 text-right font-bold text-slate-900',
  },
  {
    id: 'ownedHouseCount',
    label: CUSTOMER_FORM_LABELS.ownedHouseCount,
    placeholder: CUSTOMER_FORM_PLACEHOLDERS.ownedHouseCount,
    type: 'number',
    component: 'input',
    formatType: 'number',
    rightAddon: '채',
    hasStepper: true,
    className: 'h-8 w-[90px] text-right',
  },
];