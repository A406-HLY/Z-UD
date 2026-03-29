/**
 * @widget document-image-viewer
 * 
 * Public API - 이 위젯 슬라이스의 외부 노출 창구입니다.
 * (Why: FSD 아키텍처 규칙에 따라 내부 구현(ui, model 등)을 직접 참조하지 못하도록 캡슐화하고 필요한 컴포넌트만 노출합니다.)
 */
export { DocumentImageViewer } from './ui/DocumentImageViewer';
export { ReportPdfViewer } from './ui/ReportPdfViewer';
export { PdfRenderer } from './ui/PdfRenderer';
