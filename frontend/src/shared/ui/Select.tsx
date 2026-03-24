import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  isError?: boolean;
  isSuccess?: boolean;
}

/**
 * 프로젝트 공통 선택(Select) 컴포넌트
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, isError, isSuccess, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full border bg-white px-3 py-1.5 text-xs text-slate-800 transition-all focus:outline-none focus:ring-1 appearance-none bg-[url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E")] bg-[size:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat pr-10',
          // (P2) Default / Success State
          !isError && !isSuccess && 'border-slate-300 focus:border-[#004b93] focus:ring-[#004b93]',
          !isError && isSuccess && 'border-[#004b93] bg-blue-50 focus:border-[#004b93] focus:ring-[#004b93]',
          // (P1) Error State (OCR 필드와 동일: 평소엔 빨간 배경, 포커스 시 흰 배경 + 진한 테두리)
          isError && 'border-red-400 bg-red-50 text-red-700 focus:bg-white focus:border-red-600 focus:ring-red-600',
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
