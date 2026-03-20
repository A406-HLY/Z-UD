import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DocumentStatus } from '@/entities/verification/model/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @entity LoanDocument
 * 서류의 검증 상태를 시각적으로 표시하는 배지 컴포넌트입니다.
 */

interface StatusBadgeProps {
  status: DocumentStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    VERIFIED: 'bg-green-50 text-green-700 border-green-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels = {
    VERIFIED: '검증 완료',
    FAILED: '검토 필요',
  };

  const icons = {
    VERIFIED: '✓',
    FAILED: '!',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter border transition-all shadow-sm',
      styles[status]
    )}>
      <span className="text-[10px] leading-none">{icons[status]}</span>
      <span className="leading-none">{labels[status]}</span>
    </span>
  );
};
