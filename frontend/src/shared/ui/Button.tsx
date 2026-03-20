import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LegacySpinner } from './LegacySpinner';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/**
 * 프로젝트 공통 버튼(Button) 컴포넌트
 * (Why) 로딩 상태(isLoading)를 내장하여 API 호출 중 중복 클릭을 방지하고 시각적 피드백을 제공합니다.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center transition-colors font-medium rounded-sm focus:outline-none disabled:opacity-50 disabled:pointer-events-none gap-2';
    
    const variants = {
      primary: 'bg-[#004b93] text-white hover:bg-[#003d7a] active:scale-95 shadow-sm', // 신한/싸피은행풍 블루
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
      ghost: 'hover:bg-gray-100 text-gray-700',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <LegacySpinner size="sm" className="border-t-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
