import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = !!error;
    const errorMessage = typeof error === 'string' ? error : undefined;

    const textarea = (
      <textarea
        ref={ref}
        id={textareaId}
        className={clsx(
          'form-input w-full min-h-[80px] resize-y',
          hasError && 'border-critical',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          errorMessage ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
        }
        {...props}
      />
    );

    if (!label && !errorMessage && !hint) return textarea;

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={textareaId} className="form-label">
            {label}
          </label>
        )}
        {textarea}
        {errorMessage && (
          <span id={`${textareaId}-error`} className="form-error" role="alert">
            {errorMessage}
          </span>
        )}
        {hint && !errorMessage && (
          <span id={`${textareaId}-hint`} className="text-sm text-txt-muted">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
