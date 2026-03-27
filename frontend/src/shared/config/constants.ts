/**
 * @shared config
 * 심사 리포트 및 금융 규제 관련 전역 상수
 */

export const APPROVAL_STATUS = {
  PASS: '승인',
  REJECT: '거절',
  SUPPLEMENT: '자료 보완 요망',
  REVIEW_REQUIRED: '검토 요망',
  IRRELEVANT: '상관 없음',
} as const;

export type ApprovalStatusValues = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];

export const REGULATION_MAX = {
  LTV: 70,
  DSR: 40,
} as const;

export const UI_LIMITS = {
  MAX_VISIBLE_TABS: 5,
} as const;
