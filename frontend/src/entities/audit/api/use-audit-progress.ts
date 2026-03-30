import { useState, useEffect } from 'react';

export const useAuditProgress = (isBackendLoading: boolean) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isAllDone, setIsAllDone] = useState(false);

  useEffect(() => {

    if (isBackendLoading) return;

    const stepIds = ['credit-rating', 'loan-history', 'house-audit'];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < stepIds.length) {
        const stepId = stepIds[currentStep];
        setCompletedSteps(prev => new Set(prev).add(stepId));
        currentStep++;
      } else {
        clearInterval(interval);

        setTimeout(() => setIsAllDone(true), 300);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isBackendLoading]);

  return { completedSteps, isAllDone };
};