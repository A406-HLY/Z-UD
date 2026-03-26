import { ValidationMissing } from '../model/types';

/** 
 * 직종별 필수 서류 목록 정의 (Label 기준)
 * (Why: 문서 타입 코드보다 사용자 친화적인 라벨을 기준으로 로직을 작성하여 가독성 확보)
 */
const ESSENTIAL_DOC_LABELS = {
  COMMON: ['주민등록등본', '등기부등본', '건축물대장'],
  EMPLOYEE: ['근로소득 원천징수영수증'],
  BUSINESS: ['소득금액증명원'],
} as const;

/**
 * [WHY: 사용자 직군 정보와 백엔드 누락 서류 목록을 대조하여 서비스 차단 여부를 판별합니다.]
 * 1. 공통 필수 서류(등본 등)가 하나라도 누락되면 즉시 차단.
 * 2. 직군(직장인/사업자)에 따른 특수 필수 서류가 누락되면 차단.
 */
export const validateEssentialDocs = (
  documentMissings: ValidationMissing[],
  employmentType: string | null
) => {
  const missingLabels = documentMissings.map((m) => m.documentTypeLabel);
  
  // 1. 공통 필수 누락 항목 추출
  const missingCommon = ESSENTIAL_DOC_LABELS.COMMON.filter((label) =>
    missingLabels.includes(label)
  );

  // 2. 직군별 필수 누락 항목 추출
  let missingJobSpecific: string[] = [];
  if (employmentType === '직장인') {
    missingJobSpecific = ESSENTIAL_DOC_LABELS.EMPLOYEE.filter((label) =>
      missingLabels.includes(label)
    );
  } else if (employmentType === '사업자') {
    missingJobSpecific = ESSENTIAL_DOC_LABELS.BUSINESS.filter((label) =>
      missingLabels.includes(label)
    );
  }

  // 전체 필수 누락 목록 합산
  const allEssentialMissings = [...missingCommon, ...missingJobSpecific];
  
  // 필수 서류가 하나라도 누락되었는지 여부
  const isBlocked = allEssentialMissings.length > 0;

  return {
    isBlocked,
    /** UI 팝업에서 보여줄 필수 누락 서류 목록 */
    essentialMissings: allEssentialMissings,
    /** 필수 외에 기타 누락된 서류 목록 */
    otherMissings: missingLabels.filter((label) => !allEssentialMissings.includes(label)),
  };
};
