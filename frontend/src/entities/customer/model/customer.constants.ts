import { Customer } from './types';

export const EMPLOYMENT_TYPES = [
  '직장인',
  '자영업자',
  '프리랜서',
] as const;

export const LOAN_PURPOSE_OPTIONS = [
  '주택구입목적',
  '생활안정자금목적',
] as const;

export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
export type LoanPurposeOption = typeof LOAN_PURPOSE_OPTIONS[number];

export const EMPLOYMENT_TYPE_MAP: Record<EmploymentType, string> = {
  '직장인': 'EMPLOYEE',
  '자영업자': 'SELF_EMPLOYED',
  '프리랜서': 'FREELANCER',
};

export const LOAN_PURPOSE_MAP: Record<LoanPurposeOption, string> = {
  '주택구입목적': 'HOME_PURCHASE',
  '생활안정자금목적': 'LIVING_STABILITY',
};

export const REQUIRED_FIELDS: (keyof Customer)[] = [
  'name',
  'residentRegistrationNumber',
  'phoneNumber',
  'loanPurpose',
  'employmentType',
  'targetLoanAmount',
  'ownedHouseCount',
];

export const CUSTOMER_FORM_LABELS = {
  name: '고객 성함',
  residentRegistrationNumber: '주민번호',
  phoneNumber: '전화번호',
  loanPurpose: '대출 목적',
  employmentType: '근로 형태',
  targetLoanAmount: '희망 금액',
  ownedHouseCount: '보유 주택',
} as const;

export const CUSTOMER_FORM_PLACEHOLDERS = {
  name: '이름',
  residentRegistrationNumber: '주민번호 13자리',
  phoneNumber: '010-0000-0000',
  loanPurpose: '본인의 목적을 선택하세요',
  employmentType: '근로 형태 선택',
  targetLoanAmount: '100,000,000',
  ownedHouseCount: '0',
} as const;