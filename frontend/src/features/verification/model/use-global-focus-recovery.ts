import { useEffect } from 'react';

interface UseGlobalFocusRecoveryProps {
  handleNextDocument: () => void;
  handlePrevDocument: () => void;
}

/**
 * @feature verification
 * 서류 검증 업무 중 이미지 뷰어 확대/이동 혹은 빈 여백 클릭으로 인해 
 * 키보드 포커스가 유실되었을 때, Tab 키 입력 시 즉시 업무 흐름(에디터/사이드바)으로
 * 포커스를 복구시켜주는 글로벌 네비게이션 안전장치입니다.
 */
export const useGlobalFocusRecovery = ({
  handleNextDocument,
  handlePrevDocument
}: UseGlobalFocusRecoveryProps) => {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const active = document.activeElement;
        
        // 1. 현재 포커스 상태 판별
        const isBody = active === document.body;
        const isManagedInput = active?.hasAttribute('data-document-id');
        const isSidebarButton = active?.hasAttribute('data-doc-id');

        // 2. 포커스가 관리 대상 밖으로 벗어난 경우 (허공 클릭 등)
        if (isBody || (!isManagedInput && !isSidebarButton)) {
          
          // 3. 브라우저의 일반 폼(비밀번호 찾기, 검색창 등)을 타이핑 중이라면 개입하지 않음
          const isInputWork = ['INPUT', 'SELECT', 'TEXTAREA'].includes(active?.tagName || '');
          
          if (!isInputWork) {
            e.preventDefault(); // 기본 탭(엉뚱한 UI 요소로 날아가는 현상) 방지
            
            // 4. 의도된 검수 복구 로직 실행
            if (!e.shiftKey) {
              handleNextDocument(); // 정방향 복구
            } else {
              handlePrevDocument(); // 역방향 복구
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleNextDocument, handlePrevDocument]);
};
