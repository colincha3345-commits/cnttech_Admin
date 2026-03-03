import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OTPInput({
  length = 6,
  onComplete,
  disabled = false,
  error = false,
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 첫 번째 입력에 포커스
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // 에러 시 초기화
  useEffect(() => {
    if (error) {
      setValues(Array(length).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    // 숫자만 허용
    const digit = value.replace(/\D/g, '').slice(-1);

    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    // 다음 입력으로 포커스 이동
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // 모든 자리 입력 완료 시 콜백
    const code = newValues.join('');
    if (code.length === length && !code.includes('')) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace: 현재 값 삭제 후 이전 입력으로 이동
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (pastedData) {
      const newValues = [...values];
      pastedData.split('').forEach((digit, i) => {
        if (i < length) {
          newValues[i] = digit;
        }
      });
      setValues(newValues);

      // 붙여넣기 후 마지막 입력으로 포커스
      const lastIndex = Math.min(pastedData.length, length) - 1;
      inputRefs.current[lastIndex]?.focus();

      // 모든 자리 입력 완료 시 콜백
      if (pastedData.length >= length) {
        onComplete(pastedData.slice(0, length));
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-xl font-semibold
            border-2 rounded-lg
            focus:outline-none focus:ring-2
            transition-all duration-200
            ${error
              ? 'border-critical focus:border-critical focus:ring-critical/20'
              : 'border-border focus:border-primary focus:ring-primary/20'
            }
            ${disabled ? 'bg-bg-disabled text-txt-disabled cursor-not-allowed' : 'bg-bg-input'}
          `}
          aria-label={`인증 코드 ${index + 1}번째 자리`}
        />
      ))}
    </div>
  );
}
