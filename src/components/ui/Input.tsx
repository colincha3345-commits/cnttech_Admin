import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

import type { InputState } from '@/types';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  state?: InputState;
}

const stateClasses: Record<InputState, string> = {
  default: '',
  error: 'error',
  success: 'success',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, state = 'default', className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const computedState = error ? 'error' : state;

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx('form-input', stateClasses[computedState], className)}
          aria-invalid={computedState === 'error'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="form-error" role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-sm text-txt-muted">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
