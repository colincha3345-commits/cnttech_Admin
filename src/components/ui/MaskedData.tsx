import { useState, useCallback, type HTMLAttributes } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';

import { Button } from './Button';
import { Input } from './Input';
import { auditService } from '@/services/auditService';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/utils/permissionChecker';

interface MaskedDataProps extends HTMLAttributes<HTMLSpanElement> {
  value: string;
  maskedValue?: string;
  canUnmask?: boolean;
  onUnmask?: () => void | Promise<void>;
  resource?: string;
  /** 열람 사유 입력 필수 여부 (개인정보보호법 준수) */
  requireReason?: boolean;
}

export function MaskedData({
  value,
  maskedValue,
  canUnmask,
  onUnmask,
  className,
  resource = 'app-members',
  requireReason = true,
  ...props
}: MaskedDataProps) {
  const { user } = useAuthStore();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');

  // 권한 확인 (명시적으로 전달되지 않은 경우 app-members의 unmask 권한 확인)
  const allowed = canUnmask !== undefined
    ? canUnmask
    : (user ? hasPermission(user, 'app-members', 'unmask') : false);

  const displayValue = maskedValue || maskValue(value);

  const performUnmask = useCallback(async (unmaskReason: string) => {
    if (onUnmask) {
      setIsLoading(true);
      try {
        await onUnmask();
      } finally {
        setIsLoading(false);
      }
    }

    // 감사 로그 기록 (사유 포함)
    if (user) {
      auditService.log({
        action: 'UNMASK_DATA',
        resource,
        userId: user.id,
        details: {
          field: props['aria-label'] || 'masked_field',
          reason: unmaskReason,
        },
      });
    }

    setIsRevealed(true);
  }, [onUnmask, user, resource, props]);

  const handleToggle = async () => {
    if (!isRevealed) {
      if (requireReason) {
        setShowReasonModal(true);
        return;
      }
      await performUnmask('');
    } else {
      setIsRevealed(false);
    }
  };

  const handleReasonSubmit = async () => {
    if (!reason.trim()) return;
    setShowReasonModal(false);
    await performUnmask(reason.trim());
    setReason('');
  };

  return (
    <>
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

      {/* 개인정보 열람 사유 입력 모달 */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-txt-main mb-2">개인정보 열람</h3>
            <p className="text-sm text-txt-muted mb-4">
              개인정보보호법에 따라 열람 사유를 기록합니다.
            </p>
            <Input
              placeholder="열람 사유를 입력하세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && reason.trim()) {
                  handleReasonSubmit();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => { setShowReasonModal(false); setReason(''); }}>
                취소
              </Button>
              <Button size="sm" onClick={handleReasonSubmit} disabled={!reason.trim()}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
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
