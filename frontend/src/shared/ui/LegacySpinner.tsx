import { clsx } from 'clsx';

interface LegacySpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

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