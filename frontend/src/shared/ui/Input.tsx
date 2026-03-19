import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

/**
 * 프로젝트 공통 입력(Input) 컴포넌트
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#004b93] disabled:cursor-not-allowed disabled:opacity-50',
          isError && 'border-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
