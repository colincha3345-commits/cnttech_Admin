import { type HTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

import type { BadgeVariant, UserStatus } from '@/types';
import { USER_STATUS_CONFIG } from '@/constants';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'badge-default',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  critical: 'badge-critical',
  info: 'badge-info',
};

export function Badge({ variant, children, className, ...props }: BadgeProps) {
  return (
    <span className={clsx('badge', variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
}

interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: UserStatus;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const config = USER_STATUS_CONFIG[status] || { variant: 'info' as BadgeVariant, label: status };

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  );
}
