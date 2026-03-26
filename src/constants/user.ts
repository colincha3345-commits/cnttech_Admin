import type { BadgeVariant, UserStatus } from '@/types';

/**
 * 사용자 상태별 배지 설정
 */
export const USER_STATUS_CONFIG: Record<
  UserStatus,
  { variant: BadgeVariant; label: string }
> = {
  active: { variant: 'success', label: '활성' },
  inactive: { variant: 'info', label: '비활성' },
  locked: { variant: 'critical', label: '잠금' },
  pending: { variant: 'warning', label: '대기' },
};
