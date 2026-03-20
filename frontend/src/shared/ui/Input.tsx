import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  label?: string;
}

/**
 * 프로젝트 공통 입력(Input) 컴포넌트
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, label, id, ...props }, ref) => {
    const inputId = id || props.name;
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-10 w-full border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#004b93] disabled:cursor-not-allowed disabled:opacity-50',
            isError && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
