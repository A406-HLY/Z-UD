import { useState, useEffect } from 'react';
import { Document } from '@/entities/loan-document/model/types';

/**
 * @feature DocumentSync
 * 새로운 서류가 감지되었을 때 자동으로 체크박스를 선택하고 상태를 관리하는 비즈니스 로직입니다.
 * (Why) 위젯의 UI 레이어와 비즈니스 규칙을 분리하여 유지보수성을 높이기 위함입니다.
 */
export const useSelectSync = (docs: Document[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /** 
   * (Why) 새로운 서류가 목록에 감지되면(docs 변경) 자동으로 체크 상태를 추가합니다.
   */
  useEffect(() => {
    if (docs.length > 0) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        let hasNew = false;
        
        docs.forEach((doc) => {
          if (!next.has(doc.id)) {
            next.add(doc.id);
            hasNew = true;
          }
        });

        return hasNew ? next : prev;
      });
    }
  }, [docs]);

  /** 개별 선택 토글 */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** 전체 선택/해제 토글 */

  const toggleAll = (force?: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = docs.length > 0 && Array.from(docs).every(d => next.has(d.id));
      const shouldSelect = force !== undefined ? force : !allSelected;

      if (shouldSelect) {
        docs.forEach(d => next.add(d.id));
      } else {
        next.clear();
      }
      return next;
    });
  };

  return {
    selectedIds,
    toggleSelect,
    toggleAll,
  };
};

