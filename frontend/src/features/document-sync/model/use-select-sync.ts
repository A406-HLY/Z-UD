import { useState, useEffect } from 'react';
import { Document } from '@/entities/loan-document/model/types';

export const useSelectSync = (docs: Document[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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