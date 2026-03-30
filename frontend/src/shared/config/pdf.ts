import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

export const PDF_CONFIG = {
  WORKER_SRC: pdfWorker,
  CMAP_URL: `${import.meta.env.BASE_URL}cmaps/`,
  CMAP_PACKED: true,
} as const;