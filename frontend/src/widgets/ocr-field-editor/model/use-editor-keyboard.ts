import React from 'react';

interface UseEditorKeyboardProps {
  selectedId: string | null;
  firstErrorIndex: number;
  lastErrorIndex: number;
  onRequestNextDocument?: () => void;
}

/**
 * @hook useEditorKeyboard
 * OCR 에디터 내의 개별 필드(Input)에서 발생하는 키보드 내비게이션을 제어합니다.
 * (Why: 에디터와 사이드바, 또는 다음 문서 간의 유기적인 포커스 흐름을 보장하기 위함)
 */
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
      // 1. 역방향 탐색 (Shift + Tab): 첫 번째 에러 필드에서 사이드바 버튼으로 포커스 복구
      if (e.shiftKey && currentIndex === firstErrorIndex) {
        e.preventDefault();
        e.stopPropagation();
        
        const sidebarBtn = document.querySelector(`button[data-doc-id="${selectedId}"]`) as HTMLButtonElement | null;
        if (sidebarBtn) {
          sidebarBtn.focus();
        }
        return;
      }

      // 2. 정방향 탐색 (Tab): 마지막 에러 필드에서 다음 문서로 이동
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
