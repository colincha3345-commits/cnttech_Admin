import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface InputGroupProps {
  children: ReactNode;
  className?: string;
}

interface InputGroupInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

interface InputGroupAddonProps {
  children: ReactNode;
  align?: 'start' | 'inline-end';
  className?: string;
}

export function InputGroup({ children, className }: InputGroupProps) {
  return (
    <div className={clsx('relative flex items-center', className)}>
      {children}
    </div>
  );
}

export function InputGroupInput({ placeholder, value, onChange, className }: InputGroupInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={clsx(
        'form-input pr-20',
        className
      )}
    />
  );
}

export function InputGroupAddon({ children, align = 'start', className }: InputGroupAddonProps) {
  return (
    <div
      className={clsx(
        'absolute flex items-center text-txt-muted',
        align === 'start' && 'left-3',
        align === 'inline-end' && 'right-3',
        className
      )}
    >
      {children}
    </div>
  );
}
