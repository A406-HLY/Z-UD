import { Customer } from './types';

/**
 * @entity Customer
 * 고객 도베인에서 사용되는 공통 상수 정의입니다.
 */

/** 근로 형태 옵션 목록 */
export const EMPLOYMENT_TYPES = [
  '직장인',
  '자영업자',
  '프리랜서',
] as const;

/** 대출 목적 옵션 목록 */
export const LOAN_PURPOSE_OPTIONS = [
  '주택구입목적',
  '생활안정자금목적',
] as const;

export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
export type LoanPurposeOption = typeof LOAN_PURPOSE_OPTIONS[number];

/** (Why) 프론트엔드 한글 옵션을 백엔드 Enum(영문 대문자)으로 매핑합니다. */
export const EMPLOYMENT_TYPE_MAP: Record<EmploymentType, string> = {
  '직장인': 'EMPLOYEE',
  '자영업자': 'SELF_EMPLOYED',
  '프리랜서': 'FREELANCER',
};

export const LOAN_PURPOSE_MAP: Record<LoanPurposeOption, string> = {
  '주택구입목적': 'HOME_PURCHASE',
  '생활안정자금목적': 'LIVING_STABILITY',
};

/** (Why) 진척도 계산 및 필수 유효성 검사 기준이 되는 필드 목록입니다. */
export const REQUIRED_FIELDS: (keyof Customer)[] = [
  'name',
  'personalId',
  'phoneNumber',
  'loanPurpose',
  'employmentType',
  'desiredAmount',
  'houseCount',
];

/** (Why) UI 하드코딩을 방지하기 위한 레이블 상술입니다. */
export const CUSTOMER_FORM_LABELS = {
  name: '고객 성함',
  personalId: '주민번호',
  phoneNumber: '전화번호',
  loanPurpose: '대출 목적',
  employmentType: '근로 형태',
  desiredAmount: '희망 금액',
  houseCount: '보유 주택',
} as const;

export const CUSTOMER_FORM_PLACEHOLDERS = {
  name: '이름',
  personalId: '주민번호 13자리',
  phoneNumber: '010-0000-0000',
  loanPurpose: '본인의 목적을 선택하세요',
  employmentType: '근로 형태 선택',
  desiredAmount: '100,000,000',
  houseCount: '0',
} as const;
