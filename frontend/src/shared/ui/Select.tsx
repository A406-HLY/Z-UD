import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  isError?: boolean;
}

/**
 * 프로젝트 공통 선택(Select) 컴포넌트
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, isError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-[#004b93] disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E")] bg-[size:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat pr-10',
          isError && 'border-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
