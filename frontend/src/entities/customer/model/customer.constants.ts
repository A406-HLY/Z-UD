/**
 * @entity Customer
 * 고객 도메인에서 사용되는 공통 상수 정의입니다.
 */

/** 근로 형태 옵션 목록 */
export const EMPLOYMENT_TYPES = [
  '직장인',
  '자영업자',
  '프리랜서',
] as const;

export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
