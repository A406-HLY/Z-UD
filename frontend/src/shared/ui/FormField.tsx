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