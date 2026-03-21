import { useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// (Why: Vite 번들러 환경에서 pdfjs 워커를 안정적으로 로드하기 위한 글로벌 설정)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  fileUrl?: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: (info: { width: number; height: number }) => void;
}

/**
 * @widget document-image-viewer
 * 실제 PDF 문서의 렌더링을 담당하는 핵심 UI 로직 블록.
 */
export const PdfRenderer = ({ fileUrl, pageNumber, scale, onLoadSuccess }: Props) => {
  
  // (Why: 백엔드 API 연동 전까지 빈 캔버스 상태(Mocking) 크기를 시뮬레이션하기 위한 임시 방어 로직)
  useEffect(() => {
    if (!fileUrl) {
      // 일반적인 A4 해상도 비율 크기 반환
      onLoadSuccess({ width: 600 * scale, height: 848 * scale }); 
    }
  }, [fileUrl, scale, onLoadSuccess]);

  return (
    <div className="relative shadow-2xl bg-white flex justify-center overflow-hidden">
      {fileUrl ? (
        <Document file={fileUrl}>
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderAnnotationLayer={true} // 하이퍼링크 등 기능 동작을 위해 유지
            renderTextLayer={false} 
            // (Why: 렌더링이 완료된 실제 픽셀 크기를 상위 훅으로 올려보내 Bbox 스케일 비율 계산의 재료로 사용합니다)
            onLoadSuccess={(page) => onLoadSuccess({ width: page.originalWidth * scale, height: page.originalHeight * scale })}
          />
        </Document>
      ) : (
        <div 
          className="bg-gray-50 flex items-center justify-center border border-gray-300 transition-all"
          style={{ width: `${600 * scale}px`, height: `${848 * scale}px` }}
        >
           <span className="text-gray-400 font-bold tracking-widest text-sm">
             [ PDF 문서 대기 중 ]
           </span>
        </div>
      )}
    </div>
  );
};
