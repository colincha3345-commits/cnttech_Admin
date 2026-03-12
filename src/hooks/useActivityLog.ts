import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { auditService } from '@/services/auditService';
import { useAuthStore } from '@/stores/authStore';
import type { AuditAction, ChangedField } from '@/types/audit';

/** 페이지 방문 시 자동으로 감사 로그 기록 */
export function usePageViewLog(resource: string) {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    auditService.log({
      action: 'PAGE_VIEW',
      resource,
      userId: user?.id ?? 'anonymous',
      userName: user?.email ?? 'anonymous',
      pagePath: pathname,
      details: {},
    });
  }, [resource, pathname, user?.id, user?.email]);
}

/** 활동 로그 기록 옵션 */
interface LogOptions {
  /** 수정 항목 상세 */
  changedFields?: ChangedField[];
  /** 기타 상세 정보 */
  details?: Record<string, unknown>;
}

/** 특정 활동을 수동 기록하는 유틸 */
export function useActivityLogger() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);

  return (action: AuditAction, resource: string, options?: LogOptions) => {
    auditService.log({
      action,
      resource,
      userId: user?.id ?? 'anonymous',
      userName: user?.email ?? 'anonymous',
      pagePath: pathname,
      changedFields: options?.changedFields,
      details: options?.details ?? {},
    });
  };
}
