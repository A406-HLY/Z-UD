import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Label } from './Label';

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  isError?: boolean;
  className?: string;
  labelWidth?: string;
  required?: boolean;
}

/**
 * @shared FormField
 * 라벨, 입력 요소, 에러 상태를 하나의 행으로 정렬해주는 공통 폼 필드 컴포넌트입니다.
 * (Why) 폼 내의 반복되는 레이아웃 구조를 캡슐화하여 일관된 룩앤필을 유지하고 코드 중복을 최소화합니다.
 */
export const FormField = ({
  id,
  label,
  children,
  isError,
  className,
  labelWidth = "w-16",
  required = false,
}: FormFieldProps) => {
  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      <Label 
        htmlFor={id} 
        className={clsx(
          "text-[11px] font-bold text-right shrink-0",
          isError ? "text-red-500" : "text-slate-500",
          labelWidth
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <div className="flex-1 flex items-center relative">
        {children}
      </div>
    </div>
  );
};
