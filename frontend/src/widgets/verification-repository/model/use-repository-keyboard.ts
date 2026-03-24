import { DocItem } from '@/entities/verification/model/types';

interface UseRepositoryKeyboardProps {
  onRequestNextDocument: () => void;
  onRequestPrevDocument: () => void;
}

/**
 * @widget verification-repository
 * 좌측 사이드바(Repository)의 각 서류 항목 버튼에 대한 키보드 내비게이션 로직을 캡슐화한 훅입니다.
 * (Why: UI 컴포넌트인 VerificationRepository가 너무 많은 분기와 DOM 제어 책임을 갖지 않도록 분리합니다)
 */
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

    // 1. 방어 로직: 관리 대상 키캡이면 무조건 브라우저 스크롤 및 포커스 기본 이벤트, 버블링 차단
    if (isTab || isArrowDown || isArrowUp || isArrowRight) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      return; // 기타 키는 무시
    }

    // 2. 역방향 탐색 (버튼 간 이동)
    if (isShiftTab || isArrowUp) {
      onRequestPrevDocument();
      return;
    }

    // 3. 정방향 탐색 (문서 스킵)
    if (isArrowDown) {
      onRequestNextDocument();
      return;
    }

    // 4. 에디터 진입 로직 (에러 서류일 때 Tab 또는 ArrowRight)
    if (item.status === 'REVIEW_NEEDED' && (isTab || isArrowRight)) {
      const firstErrorInput = document.querySelector(`input[data-document-id="${item.id}"][data-nav-error="true"]`) as HTMLInputElement;
      if (firstErrorInput) {
        firstErrorInput.focus();
        return;
      }
    }

    // 5. 에러가 없거나 Input을 찾지 못한 상태에서 Tab 
    // (ArrowRight는 이 경우 아무 효과가 없어야 하므로 무시)
    if (isTab) {
      onRequestNextDocument();
    }
  };

  return { handleItemKeyDown };
};
