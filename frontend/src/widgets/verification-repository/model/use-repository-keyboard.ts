import { DocItem } from '@/entities/verification/model/types';

interface UseRepositoryKeyboardProps {
  onRequestNextDocument: () => void;
  onRequestPrevDocument: () => void;
}

export const useRepositoryKeyboard = ({
  onRequestNextDocument,
  onRequestPrevDocument
}: UseRepositoryKeyboardProps) => {

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, item: DocItem) => {
    const isTab = e.key === 'Tab';
    const isShiftTab = isTab && e.shiftKey;
    const isArrowDown = e.key === 'ArrowDown';
    const isArrowUp = e.key === 'ArrowUp';
    const isArrowRight = e.key === 'ArrowRight';

    if (isTab || isArrowDown || isArrowUp || isArrowRight) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      return;
    }

    if (isShiftTab || isArrowUp) {
      onRequestPrevDocument();
      return;
    }

    if (isArrowDown) {
      onRequestNextDocument();
      return;
    }

    if (item.status === 'REVIEW_NEEDED' && (isTab || isArrowRight)) {
      const firstErrorInput = document.querySelector(`input[data-document-id="${item.id}"][data-nav-error="true"]`) as HTMLInputElement;
      if (firstErrorInput) {
        firstErrorInput.focus();
        return;
      }
    }

    if (isTab) {
      onRequestNextDocument();
    }
  };

  return { handleItemKeyDown };
};