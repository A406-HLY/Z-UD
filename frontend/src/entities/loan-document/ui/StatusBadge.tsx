import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DocumentStatus } from '@/entities/verification/model/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
  status: DocumentStatus | 'VERIFIED' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'UPLOADING';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    VERIFIED: 'bg-green-50 text-green-700 border-green-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
    PENDING: 'bg-gray-50 text-gray-700 border-gray-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    UPLOADING: 'bg-gray-50 text-gray-700 border-gray-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REVIEW_NEEDED: 'bg-red-50 text-red-700 border-red-200',
    RISK: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    MISSING: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  const labels = {
    VERIFIED: '검증 완료',
    FAILED: '검토 필요',
    PENDING: '대기 중',
    PROCESSING: '처리 중',
    UPLOADING: '업로드 중',
    APPROVED: '승인됨',
    REVIEW_NEEDED: '검토 필요',
    RISK: '위험 주의',
    MISSING: '누락됨',
  };

  const icons = {
    VERIFIED: '✓',
    FAILED: '!',
    PENDING: '...',
    PROCESSING: '...',
    UPLOADING: '...',
    APPROVED: '✓',
    REVIEW_NEEDED: '!',
    RISK: '⚠',
    MISSING: '-',
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