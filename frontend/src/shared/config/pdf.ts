/**
 * PDF.js 라이브러리 전역 설정용 상수
 * - 금융권 폐쇄망 환경에서 참조하는 public 에셋 경로를 한곳에서 관리합니다.
 */
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export const PDF_CONFIG = {
  // (Fix) Vite 자체 Web Worker URL 기능을 사용하여 assets 폴더로 안전하게 주입 & 해시(Hash)값 추가 무효화 처리
  WORKER_SRC: workerUrl,
  // 배포 환경(BASE_URL)에 맞춰 복사된 cmaps 폴더 경로를 동적으로 설정합니다.
  CMAP_URL: `${import.meta.env.BASE_URL}cmaps/`,
  CMAP_PACKED: true,
} as const;

