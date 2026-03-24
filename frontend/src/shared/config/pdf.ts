/**
 * PDF.js 라이브러리 전역 설정용 상수
 * - 금융권 폐쇄망 환경에서 참조하는 public 에셋 경로를 한곳에서 관리합니다.
 */
export const PDF_CONFIG = {
  WORKER_SRC: '/assets/pdf.worker.min.js',
  CMAP_URL: '/assets/cmaps/',
  CMAP_PACKED: true,
} as const;
