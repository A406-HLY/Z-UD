import { useState, useMemo, useRef, useEffect } from 'react';
import { ExtractedField } from '@/entities/verification/model/types';

/**
 * @feature verification
 * PDF 뷰어의 줌/스크롤 상태 및 Bbox 좌표 스케일링을 제어하는 Controller Hook.
 */
export const usePdfController = (
  fields: ExtractedField[], 
  focusedFieldKey: string | null,
  files: Array<{ fileId: string; fileUrl?: string; pageNum: number }> = [],
  initialFileUrl?: string,
  // (Why: 백엔드에서 해상도 정보가 없을 경우의 기본값(Fallback) 처리 방안 협의 필요)
  originalWidth: number = 1240,
  originalHeight: number = 1754
) => {
  const [scale, setScale] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const currentFileUrl = useMemo(() => {
    if (files.length === 0) return initialFileUrl;
    // 현재 pageNumber와 일치하는 파일을 찾거나, 가장 가까운 파일 반환
    const targetFile = files.find(f => f.pageNum === pageNumber) || files[0];
    return targetFile?.fileUrl || initialFileUrl;
  }, [files, pageNumber, initialFileUrl]);

  const scaleRatio = useMemo(() => {
    if (!renderedSize.width || !renderedSize.height) return 1;
    
    // (Note: 가로/세로 비율이 다를 경우에 대비하여 가로 비율을 기본 스케일로 사용하되, 
    // 추후 필요시 yScaleRatio를 별도로 산출하여 좌표 정밀도를 높일 수 있습니다.)
    return renderedSize.width / originalWidth;
  }, [renderedSize.width, originalWidth]);

  // (Why: 스케일링 로직 최적화. 불필요한 State를 만들지 않고 렌더링 시점에 파생 상태로 계산합니다.)
  const scaledBboxes = useMemo(() => {
    return fields.filter(f => f.evidence && f.evidence.bbox && f.evidence.bbox.length >= 4)
      .map(f => {
        const bbox = f.evidence!.bbox!; // [x1, y1, x2, y2]
        const [x1, y1, x2, y2] = bbox;
        return {
          key: f.key,
          points: `${x1 * scaleRatio},${y1 * scaleRatio} ${x2 * scaleRatio},${y1 * scaleRatio} ${x2 * scaleRatio},${y2 * scaleRatio} ${x1 * scaleRatio},${y2 * scaleRatio}`
        };
      });
  }, [fields, scaleRatio]);

  // (Why: 외부 폼(에디터)에서 특정한 input에 포커스할 때 뷰어 컨테이너의 스크롤을 즉시 동기화합니다.)
  useEffect(() => {
    if (!focusedFieldKey || !containerRef.current || fields.length === 0) return;
    
    const field = fields.find(f => f.key === focusedFieldKey);
    if (!field || !field.evidence) return;

    // [다중 페이지 지원] 포커스된 필드의 페이지로 자동 이동
    if (field.evidence.pageNum && field.evidence.pageNum !== pageNumber) {
      setPageNumber(field.evidence.pageNum);
      // 페이지 전환 시 렌더링 대기 시간이 필요할 수 있으므로, 
      // 실제 스크롤 이동은 다음 렌더링 사이클에서 pageNumber가 일치할 때 수행되도록 로직 분리 가능
    }

    if (field.evidence.bbox && field.evidence.bbox.length >= 4 && field.evidence.pageNum === pageNumber) {
      const minY = field.evidence.bbox[1]; // [x1, y1, x2, y2] 중 y1
      
      // 타겟 Y좌표 스케일링 후, 화면 절반 높이만큼 빼서 해당 Bbox가 화면 중앙 레벨에 오도록 보정
      const targetY = (minY * scaleRatio) - (containerRef.current.clientHeight / 2) + 100;
      
      containerRef.current.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }, [focusedFieldKey, fields, scaleRatio, pageNumber]);

  // (Why: Ctrl + Wheel 조작 시 브라우저 기본 확대를 차단하고 PDF 뷰어의 스케일만 조절합니다.)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001; // 휠 속도에 따른 가중치 조절
        setScale(prev => {
          const newScale = Math.min(3, Math.max(0.4, prev + delta));
          return Number(newScale.toFixed(2));
        });
      }
    };

    // (Note: 브라우저 기본 동작 차단을 위해 passive: false 설정 필수)
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return {
    scale, 
    setScale,
    pageNumber, 
    setPageNumber,
    isLoading,
    setIsLoading,
    containerRef,
    setRenderedSize,
    scaledBboxes,
    currentFileUrl
  };
};
