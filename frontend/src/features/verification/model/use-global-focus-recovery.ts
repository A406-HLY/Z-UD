import { useEffect } from 'react';

interface UseGlobalFocusRecoveryProps {
  handleNextDocument: () => void;
  handlePrevDocument: () => void;
}

export const useGlobalFocusRecovery = ({
  handleNextDocument,
  handlePrevDocument
}: UseGlobalFocusRecoveryProps) => {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const active = document.activeElement;

        const isBody = active === document.body;
        const isManagedInput = active?.hasAttribute('data-document-id');
        const isSidebarButton = active?.hasAttribute('data-doc-id');

        if (isBody || (!isManagedInput && !isSidebarButton)) {

          const isInputWork = ['INPUT', 'SELECT', 'TEXTAREA'].includes(active?.tagName || '');

          if (!isInputWork) {
            e.preventDefault();

            if (!e.shiftKey) {
              handleNextDocument();
            } else {
              handlePrevDocument();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleNextDocument, handlePrevDocument]);
};