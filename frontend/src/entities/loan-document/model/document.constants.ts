/**
 * @entity LoanDocument
 * 대출 서류 도메인에서 사용되는 공통 상수 정의입니다.
 */

export const DOCUMENT_VIEWER_LABELS = {
  SEGMENT_A: 'BATCH SEGMENT A',
  SEGMENT_B: 'BATCH SEGMENT B',
  SCANNING_STATUS: '스캔본 불러오는 중...',
  EMPTY_MESSAGE_LINE1: '스캔된 서류가 없습니다.',
  EMPTY_MESSAGE_LINE2: '서류를 스캔해 주세요',
  NEXT_STEP_BUTTON: '다음 단계',
  UPLOADING_STATUS: '전송 중...',
} as const;

export const DOCUMENT_TABLE_HEADERS = {
  NO: 'NO.',
  FILE_NAME: 'FILE NAME',
  STATUS: 'STATUS',
} as const;

/** (Why) 전체 대출 프로세스 단계를 정의하며, 네비게이션 및 활성 탭 식별에 활용됩니다. */
export const LOAN_PROCESS_TABS = [
  { id: 'basic', label: '고객정보/서류', path: '/basic-info' },
  { id: 'ocr', label: '문서OCR검토', path: '/verification-result' },
  { id: 'data', label: '기초정보입력', path: '/customer-info' },
  { id: 'report', label: '심사레포트', path: '/review-report' },
] as const;
