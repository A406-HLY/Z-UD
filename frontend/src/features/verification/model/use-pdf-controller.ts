import { useState, useMemo, useRef, useEffect } from 'react';
import { ExtractedField } from '@/entities/verification/model/types';

/**
 * @feature verification
 * PDF 뷰어의 줌/스크롤 상태 및 Bbox 좌표 스케일링을 제어하는 Controller Hook.
 */
export const usePdfController = (
  fields: ExtractedField[], 
  focusedFieldKey: string | null,
  // TODO: 백엔드에서 해상도 정보가 없을 경우의 기본값(Fallback) 처리 방안 협의 필요
  originalWidth: number = 1240 
) => {
  const [scale, setScale] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const scaleRatio = useMemo(() => {
    if (!renderedSize.width) return 1;
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
    if (field && field.evidence && field.evidence.bbox && field.evidence.bbox.length >= 4) {
      const minY = field.evidence.bbox[1]; // [x1, y1, x2, y2] 중 y1
      
      // 타겟 Y좌표 스케일링 후, 화면 절반 높이만큼 빼서 해당 Bbox가 화면 중앙 레벨에 오도록 보정
      const targetY = (minY * scaleRatio) - (containerRef.current.clientHeight / 2) + 100;
      
      containerRef.current.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }, [focusedFieldKey, fields, scaleRatio]);

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
    scaledBboxes
  };
};
