import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ExtractedField } from '@/entities/verification/model/types';
import { useAppSelector } from '@/app/store/hooks';

export const usePdfController = (
  fields: ExtractedField[],
  focusedFieldKey: string | null,
  files: Array<{ fileId: string; fileUrl?: string; pageNum: number }> = [],
  initialFileUrl?: string,
  options: {
    scale?: number;
    pageNumber?: number;
    onScaleChange?: (scale: number) => void;
    onPageChange?: (page: number) => void;
    outlineMap?: Record<string, { pageNumber: number; yRatio: number }>;
  } = {}
) => {

  const [scale, setInternalScale] = useState(options.scale ?? 1);

  const [pageNumber, setInternalPageNumber] = useState(options.pageNumber ?? 1);
  const [isLoading, setIsLoading] = useState(false);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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
    const targetFile = files.find(f => f.pageNum === pageNumber) || files[0];
    return targetFile?.fileUrl || initialFileUrl;
  }, [files, pageNumber, initialFileUrl]);

  const bboxes = useMemo(() => {
    return fields.filter(f => f.evidence && f.evidence.bbox && f.evidence.bbox.length >= 4 && f.evidence.pageNum === pageNumber)
      .map(f => {
        const [x1, y1, x2, y2] = f.evidence!.bbox!;

        return {
          key: f.key,
          points: `${x1},${y1} ${x2},${y1} ${x2},${y2} ${x1},${y2}`
        };
      });
  }, [fields, pageNumber]);

  useEffect(() => {
    if (!focusedFieldKey || !containerRef.current || fields.length === 0 || !renderedSize.height) return;

    const field = fields.find(f => f.key === focusedFieldKey);
    if (!field || !field.evidence) return;

    if (field.evidence.pageNum && field.evidence.pageNum !== pageNumber) {
      setPageNumber(field.evidence.pageNum);
    }

    if (field.evidence.bbox && field.evidence.bbox.length >= 4 && field.evidence.pageNum === pageNumber) {
      const [,, , y2] = field.evidence.bbox;
      const y1 = field.evidence.bbox[1];

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

  const selectedArticle = useAppSelector(state => state.review.selectedArticle);
  useEffect(() => {
    if (!selectedArticle || selectedArticle.length === 0 || !options.outlineMap || !containerRef.current || !renderedSize.height) return;

    const targetArticle = selectedArticle[0];

    const normalizedTarget = targetArticle.replace(/\s/g, '');
    const entry = Object.entries(options.outlineMap).find(([title]) => {
      const normalizedTitle = title.replace(/\s/g, '');
      return normalizedTitle.includes(normalizedTarget) || normalizedTarget.includes(normalizedTitle);
    });

    if (entry) {
      const { pageNumber: targetPage, yRatio } = entry[1];

      if (targetPage !== pageNumber) {
        setPageNumber(targetPage);
      }

      if (targetPage === pageNumber) {
        const container = containerRef.current;
        const paddingTop = parseInt(window.getComputedStyle(container).paddingTop, 10) || 0;

        const visualY = (yRatio * renderedSize.height * scale) + paddingTop;
        const targetY = visualY - (container.clientHeight / 2);

        container.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth'
        });
      }
    }
  }, [selectedArticle, options.outlineMap, pageNumber, renderedSize.height, scale]);

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