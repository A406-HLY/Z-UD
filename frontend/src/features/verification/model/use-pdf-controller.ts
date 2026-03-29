import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ExtractedField } from '@/entities/verification/model/types';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { setSelectedArticle } from '@/entities/review/model/review.slice';

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
    outlineMap?: Record<string, { pageNumber: number; yRatio: number }>;
  } = {}
) => {
  const dispatch = useAppDispatch();


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
        // (Why: Bbox는 [x1, y1, x2, y2] 형태의 상대 좌표 비율입니다.)
        const [x1, y1, x2, y2] = f.evidence!.bbox!;  
        
        // 원본 비율 좌표를 그대로 반환 (SVG viewBox="0 0 1 1"에서 자동 매핑)
        return {
          key: f.key,
          points: `${x1},${y1} ${x2},${y1} ${x2},${y2} ${x1},${y2}`
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
      const [,, , y2] = field.evidence.bbox;
      const y1 = field.evidence.bbox[1];
      
      // (Why: Bbox의 기하학적 중앙(y1, y2의 평균)이 뷰어의 세로 중앙에 오도록 계산합니다.)
      // (Note: 컨테이너의 상단 패딩(p-12=48px)과 현재 확대 배율(scale)을 모두 반영하여 위치를 잡습니다.)
      const centerY = (y1 + y2) / 2;
      const container = containerRef.current;
      const paddingTop = parseInt(window.getComputedStyle(container).paddingTop, 10) || 0;
      
      const visualY = (centerY * renderedSize.height * scale) + paddingTop;
      const targetY = visualY - (container.clientHeight / 2);
      
      container.scrollTo({ 
        top: Math.max(0, targetY), 
        behavior: 'smooth' 
      });
    }
  }, [focusedFieldKey, fields, renderedSize.height, pageNumber, scale]);

  // (Feature: 레포트 조항 클릭 시 해당 북마크 위치로 자동 스크롤)
  const selectedArticle = useAppSelector(state => state.review.selectedArticle);
  useEffect(() => {
    if (!selectedArticle || selectedArticle.length === 0 || !options.outlineMap || !containerRef.current || !renderedSize.height) return;

    const targetArticle = selectedArticle[0];
    
    // (Note: "제1조"와 "제1조 대출심사" 등을 매칭하기 위해 공백 제거 후 포함 여부 확인)
    const normalizedTarget = targetArticle.replace(/\s/g, '');
    const entry = Object.entries(options.outlineMap).find(([title]) => {
      const normalizedTitle = title.replace(/\s/g, '');
      return normalizedTitle.includes(normalizedTarget) || normalizedTarget.includes(normalizedTitle);
    });

    if (entry) {
      const { pageNumber: targetPage, yRatio } = entry[1];
      
      // 1. 페이지가 다르면 이동
      if (targetPage !== pageNumber) {
        setPageNumber(targetPage);
      }
      
      // 2. 현재 페이지가 목표 페이지인 경우 정밀 스크롤 (중앙 정렬) 및 상태 클리어
      if (targetPage === pageNumber) {
        const container = containerRef.current;
        const paddingTop = parseInt(window.getComputedStyle(container).paddingTop, 10) || 0;
        
        // yRatio는 상단 기준 비율 (0~1)
        const visualY = (yRatio * renderedSize.height * scale) + paddingTop;
        const targetY = visualY - (container.clientHeight / 2);
        
        container.scrollTo({ 
          top: Math.max(0, targetY), 
          behavior: 'smooth' 
        });

        // (Why) 이동이 완료되었으므로 Redux 상태를 초기화하여 수동 내비게이션을 허용합니다.
        dispatch(setSelectedArticle(null));
      }
    } else {
        // (Why) 아웃라인 맵에 해당 조항이 없는 경우에도 무한 루프 방지를 위해 상태를 조기 초기화합니다.
        // 단, 외부 articlePageMap(Parent)에 의해 이미 페이지 이동이 일어난 상황일 수 있습니다.
        dispatch(setSelectedArticle(null));
    }
  }, [selectedArticle, options.outlineMap, pageNumber, renderedSize.height, scale, dispatch]);

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
    renderedSize,
    setRenderedSize,
    bboxes,
    currentFileUrl
  };
};
