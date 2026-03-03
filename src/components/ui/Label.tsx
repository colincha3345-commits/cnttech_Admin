import { type LabelHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ children, className, required, ...props }: LabelProps) {
  return (
    <label
      className={clsx(
        'text-sm font-medium text-txt-main',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-critical ml-1">*</span>}
    </label>
  );
}
