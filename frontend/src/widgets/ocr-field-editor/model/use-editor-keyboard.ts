import React from 'react';

interface UseEditorKeyboardProps {
  selectedId: string | null;
  firstErrorIndex: number;
  lastErrorIndex: number;
  onRequestNextDocument?: () => void;
}

export const useEditorKeyboard = ({
  selectedId,
  firstErrorIndex,
  lastErrorIndex,
  onRequestNextDocument,
}: UseEditorKeyboardProps) => {

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentIndex: number
  ) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && currentIndex === firstErrorIndex) {
        e.preventDefault();
        e.stopPropagation();

        const sidebarBtn = document.querySelector(`button[data-doc-id="${selectedId}"]`) as HTMLButtonElement | null;
        if (sidebarBtn) {
          sidebarBtn.focus();
        }
        return;
      }

      if (!e.shiftKey && currentIndex === lastErrorIndex) {
        e.preventDefault();
        e.stopPropagation();

        if (onRequestNextDocument) {
          onRequestNextDocument();
        }
        return;
      }
    }
  };

  return { handleInputKeyDown };
};