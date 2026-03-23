import { clsx } from 'clsx';

interface LegacySpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * @component LegacySpinner
 * 레거시 스타일의 고전적인 CSS 회전 로더입니다.
 * (Why) B2B 무드에 맞게 화려하지 않은 담백한 로딩 애니메이션을 제공하며, 여러 위젯에서 공통으로 사용합니다.
 */
export const LegacySpinner = ({ className, size = 'md' }: LegacySpinnerProps) => {
  const sizeClasses = {
    sm: 'w-2.5 h-2.5 border-2',
    md: 'w-4 h-4 border-2',
    lg: 'w-6 h-6 border-3',
  };

  return (
    <div 
      className={clsx(
        "border-slate-300 border-t-slate-800 animate-spin rounded-full shrink-0",
        sizeClasses[size],
        className
      )} 
    />
  );
};
