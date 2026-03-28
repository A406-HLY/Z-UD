/**
 * PDF.js 라이브러리 전역 설정용 상수
 * - 금융권 폐쇄망 환경에서 참조하는 public 에셋 경로를 한곳에서 관리합니다.
 */
export const PDF_CONFIG = {
  // Vite의 어셋 번들링에서 분리하여 정적 경로에서 직접 워커를 불러옵니다. (MIME 에러 완벽 회피)
  WORKER_SRC: `${import.meta.env.BASE_URL}pdf.worker.mjs`,
  // 배포 환경(BASE_URL)에 맞춰 복사된 cmaps 폴더 경로를 동적으로 설정합니다.
  CMAP_URL: `${import.meta.env.BASE_URL}cmaps/`,
  CMAP_PACKED: true,
} as const;

