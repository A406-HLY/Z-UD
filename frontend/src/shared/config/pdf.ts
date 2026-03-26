import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

/**
 * PDF.js 라이브러리 전역 설정용 상수
 * - 금융권 폐쇄망 환경에서 참조하는 public 에셋 경로를 한곳에서 관리합니다.
 */
export const PDF_CONFIG = {
  // Vite의 ?url 접미사를 사용하여 빌드 시 해시가 붙은 로컬 워커 경로를 자동으로 가져옵니다.
  WORKER_SRC: pdfWorker,
  // 배포 환경(BASE_URL)에 맞춰 복사된 cmaps 폴더 경로를 동적으로 설정합니다.
  CMAP_URL: `${import.meta.env.BASE_URL}cmaps/`,
  CMAP_PACKED: true,
} as const;
