import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { auditService } from '@/services/auditService';
import { useAuthStore } from '@/stores/authStore';
import type { AuditAction } from '@/types/audit';

/** 페이지 방문 시 자동으로 감사 로그 기록 */
export function usePageViewLog(resource: string) {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    auditService.log({
      action: 'ACCESS_ATTEMPT',
      resource,
      userId: user?.id ?? 'anonymous',
      details: { path: pathname },
    });
  }, [resource, pathname, user?.id]);
}

/** 특정 활동을 수동 기록하는 유틸 */
export function useActivityLogger() {
  const user = useAuthStore((s) => s.user);

  return (action: AuditAction, resource: string, details?: Record<string, unknown>) => {
    auditService.log({
      action,
      resource,
      userId: user?.id ?? 'anonymous',
      details: details ?? {},
    });
  };
}
