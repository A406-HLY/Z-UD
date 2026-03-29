import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  // (Why: 동기화 기능을 위해 해상도 정보를 포함한 외부 제어 옵션을 통합 객체로 수신합니다.)
  options: {
    scale?: number;
    pageNumber?: number;
    onScaleChange?: (scale: number) => void;
    onPageChange?: (page: number) => void;
  } = {}
) => {

  const [scale, setInternalScale] = useState(options.scale ?? 1);
  // (Note: 더블 캔버스 및 정적 고해상도 도입으로 renderScale/renderMode 관리를 제거합니다.)
  
  const [pageNumber, setInternalPageNumber] = useState(options.pageNumber ?? 1);
  const [isLoading, setIsLoading] = useState(false);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // (Why: 외부에서 동기화된 값이 들어올 경우 내부 상태를 업데이트합니다.)
  useEffect(() => {
    if (options.scale !== undefined && options.scale !== scale) {
      setInternalScale(options.scale);
    }
  }, [options.scale]);

  // (Note: 실시간 scale 변화에 따른 리렌더링 트리거 로직을 삭제합니다. 이제 줌은 CSS transform으로만 처리됩니다.)

  useEffect(() => {
    if (options.pageNumber !== undefined && options.pageNumber !== pageNumber) {
      setInternalPageNumber(options.pageNumber);
    }
  }, [options.pageNumber]);

  /** 
   * 상태 변경 래퍼 함수 (Why: 로컬 변경 시 외부 콜백을 호출하여 동기화 이벤트를 트리거합니다.)
   */
  const setScale = useCallback((val: number | ((prev: number) => number)) => {
    setInternalScale(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      options.onScaleChange?.(next);
      return next;
    });
  }, [options.onScaleChange]);

  const setPageNumber = useCallback((val: number | ((prev: number) => number)) => {
    setInternalPageNumber(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      options.onPageChange?.(next);
      return next;
    });
  }, [options.onPageChange]);

  const currentFileUrl = useMemo(() => {
    if (files.length === 0) return initialFileUrl;
    // 현재 pageNumber와 일치하는 파일을 찾거나, 가장 가까운 파일 반환
    const targetFile = files.find(f => f.pageNum === pageNumber) || files[0];
    return targetFile?.fileUrl || initialFileUrl;
  }, [files, pageNumber, initialFileUrl]);

  // (Why: 수동 배율 계산 로직을 삭제하고 브라우저 SVG viewBox 엔진에 렌더링을 위임합니다.)
  // 현재 pageNumber에 해당하는 필드의 bbox만 표시
  const bboxes = useMemo(() => {
    return fields.filter(f => f.evidence && f.evidence.bbox && f.evidence.bbox.length >= 4 && f.evidence.pageNum === pageNumber)
      .map(f => {
        const bbox = f.evidence!.bbox!; // [x1, y1, x2, y2]
        const [x1, y1, x2, y2] = bbox;
        
        // 원본 좌표를 그대로 반환 (SVG viewBox에서 자동 매핑)
        return {
          key: f.key,
          points: `${x1},${y1} ${x2},${y1} ${x2},${y2} ${x1},${y2}` // typo 방지 및 가독성
        };
      });
  }, [fields, pageNumber]);

  // (Why: 외부 폼(에디터)에서 특정한 input에 포커스할 때 뷰어 컨테이너의 스크롤을 즉시 동기화합니다.)
  useEffect(() => {
    if (!focusedFieldKey || !containerRef.current || fields.length === 0 || !renderedSize.height) return;
    
    const field = fields.find(f => f.key === focusedFieldKey);
    if (!field || !field.evidence) return;

    // [다중 페이지 지원] 포커스된 필드의 페이지로 자동 이동
    if (field.evidence.pageNum && field.evidence.pageNum !== pageNumber) {
      setPageNumber(field.evidence.pageNum);
    }

    if (field.evidence.bbox && field.evidence.bbox.length >= 4 && field.evidence.pageNum === pageNumber) {
      const minY = field.evidence.bbox[1]; // y1 (상대 좌표: 0.0 ~ 1.0)
      
      // 스크롤 위치 계산: 상대 좌표 * 실제 렌더링 높이
      const targetY = (minY * renderedSize.height) - (containerRef.current.clientHeight / 2) + 100;
      
      // (Why: 더 이상 줌 완료 시점의 튐 현상이 없으므로 부드러운 스크롤을 기본으로 사용합니다.)
      containerRef.current.scrollTo({ 
        top: Math.max(0, targetY), 
        behavior: 'smooth' 
      });
    }
  }, [focusedFieldKey, fields, renderedSize.height, pageNumber]);

  // (Why: Ctrl + Wheel 조작 시 브라우저 기본 확대를 차단하고 PDF 뷰어의 스케일만 조절합니다.)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001; 
        setScale(prev => {
          const newScale = Math.min(3, Math.max(0.4, prev + delta));
          return Number(newScale.toFixed(2));
        });
      }
    };

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
    bboxes,
    currentFileUrl
  };
};
