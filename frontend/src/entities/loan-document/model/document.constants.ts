/**
 * @entity LoanDocument
 * 대출 서류 도메인에서 사용되는 공통 상수 정의입니다.
 */

export const DOCUMENT_VIEWER_LABELS = {
  SEGMENT_A: '스캔 서류',
  SEGMENT_B: '업로드 서류',
  SCANNING_STATUS: '스캔본 불러오는 중...',
  EMPTY_MESSAGE_LINE1: '스캔된 서류가 없습니다.',
  EMPTY_MESSAGE_LINE2: '서류를 스캔해 주세요',
  NEXT_STEP_BUTTON: '서류 검증',
  UPLOADING_STATUS: '전송 중...',
} as const;

export const DOCUMENT_TABLE_HEADERS = {
  NO: 'NO.',
  FILE_NAME: 'FILE NAME',
  STATUS: 'STATUS',
} as const;

/** (Why) 전체 대출 프로세스 단계를 정의하며, 추후 상태 기반 네비게이션에 활용됩니다. */
export const LOAN_PROCESS_TABS = [
  { id: 'docs', label: '서류제출' },
  { id: 'result', label: '검증결과' },
  { id: 'myData', label: '마이데이터' },
  { id: 'report', label: '리포트' },
] as const;
