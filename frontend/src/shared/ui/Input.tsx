import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  isSuccess?: boolean;
  label?: string;
  rightElement?: React.ReactNode;
  inputClassName?: string;
}

/**
 * 프로젝트 공통 입력(Input) 컴포넌트
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, isSuccess, label, id, rightElement, inputClassName, ...props }, ref) => {
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
        <div className={cn(
          "flex items-center relative border transition-all",
          "bg-white focus-within:ring-1",
          // (P2) Default / Success State
          !isError && !isSuccess && "border-slate-300 focus-within:border-[#004b93] focus-within:ring-[#004b93]",
          !isError && isSuccess && "border-[#004b93] bg-blue-50/10 focus-within:border-[#004b93] focus-within:ring-[#004b93]",
          // (P1) Error State (Focus 시에도 빨간색 유지)
          isError && "border-red-500 focus-within:bg-red-50 focus-within:border-red-600 focus-within:ring-red-200",
          className
        )}>
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 w-full h-full min-h-[38px] px-3 py-1.5 text-xs bg-transparent border-none outline-none ring-0 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
              "focus:ring-0 focus:outline-none focus:border-none", 
              rightElement && "pr-8",
              inputClassName
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-2 flex items-center h-full pointer-events-none">
              {rightElement}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
