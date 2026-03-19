import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @entity LoanDocument
 * 서류의 검증 및 전송 상태를 시각적으로 표시하는 배지 컴포넌트입니다.
 */

interface StatusBadgeProps {
  status: 'VERIFIED' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'UPLOADING';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    VERIFIED: 'text-green-600 flex items-center gap-1',
    PENDING: 'text-orange-500 flex items-center gap-1',
    PROCESSING: 'text-blue-500 flex items-center gap-1',
    UPLOADING: 'text-blue-600 flex items-center gap-1 animate-pulse',
    FAILED: 'text-red-500 flex items-center gap-1',
  };

  const labels = {
    VERIFIED: 'VERIFIED',
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    UPLOADING: 'UPLOADING',
    FAILED: 'FAILED',
  };

  const icons = {
    VERIFIED: '✓',
    PENDING: '◎',
    PROCESSING: '◎',
    UPLOADING: '↑',
    FAILED: '!',
  };

  return (
    <span className={cn('text-[10px] font-bold whitespace-nowrap', styles[status])}>
      <span>{icons[status]}</span>
      {labels[status]}
    </span>
  );
};
