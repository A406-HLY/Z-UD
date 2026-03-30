import { ValidationMissing } from '../model/types';

const ESSENTIAL_DOC_LABELS = {
  COMMON: ['주민등록등본', '등기부등본', '건축물대장'],
  EMPLOYEE: ['근로소득 원천징수영수증'],
  BUSINESS: ['소득금액증명원'],
} as const;

export const validateEssentialDocs = (
  documentMissings: ValidationMissing[],
  employmentType: string | null
) => {
  const missingLabels = documentMissings.map((m) => m.documentTypeLabel);

  const missingCommon = ESSENTIAL_DOC_LABELS.COMMON.filter((label) =>
    missingLabels.includes(label)
  );

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

  const allEssentialMissings = [...missingCommon, ...missingJobSpecific];

  const isBlocked = allEssentialMissings.length > 0;

  return {
    isBlocked,

    essentialMissings: allEssentialMissings,

    otherMissings: missingLabels.filter((label) => !allEssentialMissings.includes(label)),
  };
};