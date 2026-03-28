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
    originalWidth?: number;
    originalHeight?: number;
  } = {}
) => {
  const { 
    originalWidth = 1240, 
    originalHeight = 1754 
  } = options;

  const [scale, setInternalScale] = useState(options.scale ?? 1);
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

  const scaleRatios = useMemo(() => {
    if (!renderedSize.width || !renderedSize.height || !originalWidth || !originalHeight) {
      return { x: 1, y: 1 };
    }
    
    // (Why: 가로와 세로의 원본 대비 렌더링 비율을 각각 계산하여 좌표 정밀도를 극대화합니다.)
    return {
      x: renderedSize.width / originalWidth,
      y: renderedSize.height / originalHeight
    };
  }, [renderedSize, originalWidth, originalHeight]);

  // (Why: 스케일링 로직 최적화. 불필요한 State를 만들지 않고 렌더링 시점에 파생 상태로 계산합니다.)
  // 현재 pageNumber에 해당하는 필드의 bbox만 표시
  const scaledBboxes = useMemo(() => {
    return fields.filter(f => f.evidence && f.evidence.bbox && f.evidence.bbox.length >= 4 && f.evidence.pageNum === pageNumber)
      .map(f => {
        const bbox = f.evidence!.bbox!; // [x1, y1, x2, y2]
        const [x1, y1, x2, y2] = bbox;
        
        // (Why: 계산된 X/Y 비율을 각각 적용하여 SVG 좌표로 변환합니다.)
        const sx1 = x1 * scaleRatios.x;
        const sy1 = y1 * scaleRatios.y;
        const sx2 = x2 * scaleRatios.x;
        const sy2 = y2 * scaleRatios.y;

        return {
          key: f.key,
          points: `${sx1},${sy1} ${sx2},${sy1} ${sx2},${sy2} ${sx1},${sy2}`
        };
      });
  }, [fields, scaleRatios, pageNumber]);

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
      const targetY = (minY * scaleRatios.y) - (containerRef.current.clientHeight / 2) + 100;
      
      containerRef.current.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }, [focusedFieldKey, fields, scaleRatios, pageNumber]);

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
