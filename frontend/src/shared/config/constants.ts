

export const APPROVAL_STATUS = {
  PASS: '승인',
  REJECT: '반려',
  SUPPLEMENT: '자료 보완 요망',
  REVIEW_REQUIRED: '검토',
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