import React, { useState, useCallback } from 'react';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onSearch?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = '검색...',
  className,
  disabled = false,
  onSearch,
  onFocus,
  onBlur,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(value);
      }
    },
    [value, onSearch]
  );

  return (
    <div className={clsx('relative flex items-center', className)}>
      {/* 검색 아이콘 */}
      <div className="absolute left-3 flex items-center justify-center pointer-events-none">
        <SearchOutlined
          style={{ fontSize: 16 }}
          className={clsx(
            'transition-colors',
            isFocused ? 'text-primary' : 'text-txt-muted'
          )}
        />
      </div>

      {/* 검색 입력 */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
        className={clsx(
          'form-input h-10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />

      {/* 클리어 버튼 */}
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 flex items-center justify-center text-txt-muted hover:text-txt-main transition-colors"
          aria-label="검색어 지우기"
        >
          <CloseCircleOutlined style={{ fontSize: 16 }} />
        </button>
      )}
    </div>
  );
};
