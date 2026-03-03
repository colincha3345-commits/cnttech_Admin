import { useState, type HTMLAttributes } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';

import { Button } from './Button';
import { auditService } from '@/services/auditService';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/utils/permissionChecker';

interface MaskedDataProps extends HTMLAttributes<HTMLSpanElement> {
  value: string;
  maskedValue?: string;
  canUnmask?: boolean;
  onUnmask?: () => void | Promise<void>;
  resource?: string;
}

export function MaskedData({
  value,
  maskedValue,
  canUnmask,
  onUnmask,
  className,
  resource = 'app-members',
  ...props
}: MaskedDataProps) {
  const { user } = useAuthStore();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 권한 확인 (명시적으로 전달되지 않은 경우 app-members의 unmask 권한 확인)
  const allowed = canUnmask !== undefined
    ? canUnmask
    : (user ? hasPermission(user, 'app-members', 'unmask') : false);

  const displayValue = maskedValue || maskValue(value);

  const handleToggle = async () => {
    if (!isRevealed) {
      if (onUnmask) {
        setIsLoading(true);
        try {
          await onUnmask();
        } finally {
          setIsLoading(false);
        }
      }

      // 감사 로그 기록
      if (user) {
        auditService.log({
          action: 'UNMASK_DATA',
          resource,
          userId: user.id,
          details: { field: props['aria-label'] || 'masked_field', value: isRevealed ? value : '[HIDDEN]' },
        });
      }

      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

  return (
    <span className={clsx('inline-flex items-center gap-2', className)} {...props}>
      <span className={clsx(
        'masked-data',
        isRevealed && 'revealed'
      )}>
        {isRevealed ? value : displayValue}
      </span>
      {allowed && (
        <Button
          variant="unmask"
          size="sm"
          onClick={handleToggle}
          isLoading={isLoading}
          className="btn-icon !p-1.5"
          aria-label={isRevealed ? '마스킹 적용' : '마스킹 해제'}
        >
          {isRevealed ? <EyeInvisibleOutlined style={{ fontSize: 16 }} /> : <EyeOutlined style={{ fontSize: 16 }} />}
        </Button>
      )}
    </span>
  );
}

// Default masking functions
function maskValue(value: string): string {
  // Phone number: 010-****-1234
  if (/^\d{3}-\d{4}-\d{4}$/.test(value)) {
    return value.replace(/^(\d{3})-(\d{4})-(\d{4})$/, '$1-****-$3');
  }

  // Email: hong****@example.com
  if (value.includes('@')) {
    const parts = value.split('@');
    const local = parts[0] ?? '';
    const domain = parts[1] ?? '';
    const maskedLocal = local.length > 4
      ? local.slice(0, 4) + '****'
      : local.slice(0, 1) + '***';
    return `${maskedLocal}@${domain}`;
  }

  // Default: show first and last 2 characters
  if (value.length > 4) {
    return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
  }

  return '****';
}
