import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDF_CONFIG } from '@/shared/config/pdf';
import { extractOutlineMap } from '@/shared/lib/pdf/pdf-utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CONFIG.WORKER_SRC;

interface Props {
  fileUrl?: string;
  pageNumber: number;
  scale: number;
  baseWidth: number;
  onLoadSuccess: (info: { width: number; height: number }) => void;
  onDocumentLoad?: (info: { numPages: number }) => void;
  onOutlineLoaded?: (outlineMap: Record<string, { pageNumber: number; yRatio: number }>) => void;
  setIsLoading: (loading: boolean) => void;
}

export const PdfRenderer = ({ fileUrl, pageNumber, baseWidth, onLoadSuccess, onDocumentLoad, onOutlineLoaded, setIsLoading }: Props) => {
  const lowResCanvasRef = useRef<HTMLCanvasElement>(null);
  const highResCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(0);
  const [renderPhase, setRenderPhase] = useState<'empty' | 'low' | 'high'>('empty');

  const lowResRenderTask = useRef<pdfjsLib.RenderTask | null>(null);
  const highResRenderTask = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    if (!fileUrl) {
      setPdfDoc(null);
      return;
    }

    let isMounted = true;
    const loadDocument = async () => {
      setIsLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: PDF_CONFIG.CMAP_URL,
          cMapPacked: PDF_CONFIG.CMAP_PACKED,
        });
        const pdf = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(pdf);
          onDocumentLoad?.({ numPages: pdf.numPages });

          extractOutlineMap(pdf).then(map => {
            if (isMounted) onOutlineLoaded?.(map);
          });
        } else {
          pdf.destroy();
        }
      } catch (error) {

        if (isMounted) setIsLoading(false);
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
      if (pdfDoc) {
        pdfDoc.destroy().catch(console.error);
      }
    };
  }, [fileUrl]);

  const viewWidth = baseWidth;
  const viewHeight = viewWidth * aspectRatio;

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc) {
        onLoadSuccess({ width: viewWidth, height: 0 });
        return;
      }

      setIsLoading(true);

      try {
        lowResRenderTask.current?.cancel();
        highResRenderTask.current?.cancel();
        setRenderPhase('empty');

        const page = await pdfDoc.getPage(pageNumber);
        const originalViewport = page.getViewport({ scale: 1 });
        const newAspectRatio = originalViewport.height / originalViewport.width;
        setAspectRatio(newAspectRatio);

        onLoadSuccess({ width: viewWidth, height: viewWidth * newAspectRatio });

        const dpr = Math.max(window.devicePixelRatio || 1, 2.0);

        const lowResViewport = page.getViewport({ scale: (viewWidth * dpr) / originalViewport.width });
        const lowResCanvas = lowResCanvasRef.current;
        if (lowResCanvas) {
          const context = lowResCanvas.getContext('2d');
          if (context) {
            lowResCanvas.width = lowResViewport.width;
            lowResCanvas.height = lowResViewport.height;
            lowResRenderTask.current = page.render({ canvasContext: context, viewport: lowResViewport });
            await lowResRenderTask.current.promise;
            setRenderPhase('low');
            setIsLoading(false);
          }
        }

        const HIGH_RES_SCALE = 2.5;
        const highResViewport = page.getViewport({ scale: (viewWidth * HIGH_RES_SCALE * dpr) / originalViewport.width });
        const highResCanvas = highResCanvasRef.current;
        if (highResCanvas) {
          const context = highResCanvas.getContext('2d');
          if (context) {
            highResCanvas.width = highResViewport.width;
            highResCanvas.height = highResViewport.height;
            highResRenderTask.current = page.render({ canvasContext: context, viewport: highResViewport });
            await highResRenderTask.current.promise;
            setRenderPhase('high');
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'RenderingCancelledException') return;

        setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      lowResRenderTask.current?.cancel();
      highResRenderTask.current?.cancel();
    };
  }, [pdfDoc, pageNumber, baseWidth, onLoadSuccess]);

  return (
    <div
      className="relative shadow-2xl bg-white flex justify-center overflow-hidden shrink-0"
      style={{ width: `${viewWidth}px`, height: `${viewHeight}px` }}
    >
      <canvas
        ref={lowResCanvasRef}
        className={`absolute inset-0 w-full h-full shadow-inner transition-opacity duration-300 ${renderPhase === 'high' ? 'opacity-0' : 'opacity-100'}`}
      />

      <canvas
        ref={highResCanvasRef}
        className={`absolute inset-0 w-full h-full shadow-inner transition-opacity duration-500 ${renderPhase === 'high' ? 'opacity-100' : 'opacity-0'}`}
      />

      {renderPhase === 'empty' && !fileUrl && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center border border-gray-300">
           <span className="text-gray-400 font-bold tracking-widest text-xs">
             [ 분석 대상 문서 대기 중 ]
           </span>
        </div>
      )}

      <div
        className="absolute inset-0 z-10 select-none"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};