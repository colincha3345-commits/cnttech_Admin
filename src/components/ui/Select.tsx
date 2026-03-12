import { type SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = !!error;
    const errorMessage = typeof error === 'string' ? error : undefined;

    const select = (
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          'form-input w-full',
          hasError && 'border-critical',
          className
        )}
        aria-invalid={hasError}
        {...props}
      >
        {children}
      </select>
    );

    if (!label && !errorMessage) return select;

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={selectId} className="form-label">
            {label}
          </label>
        )}
        {select}
        {errorMessage && (
          <span id={`${selectId}-error`} className="form-error" role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
