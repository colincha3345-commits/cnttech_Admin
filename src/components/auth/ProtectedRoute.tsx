import { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import type { PermissionAction } from '@/types';
import type { Resource } from '@/types/rbac';
import { hasPermission, getAccessibleRoutes } from '@/utils/permissionChecker';
import { auditService } from '@/services/auditService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: {
    resource: Resource;
    action: PermissionAction;
  }[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermissions,
  fallback,
}: ProtectedRouteProps) {
  const { user, status, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (status === 'idle') {
      checkAuth();
    }
  }, [status, checkAuth]);

  // 로딩 중
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8" />
          <p className="text-txt-muted text-sm">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 미인증
  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // MFA 필요
  if (status === 'mfa_required') {
    return <Navigate to="/login" state={{ mfaRequired: true, from: location }} replace />;
  }

  // 권한 확인
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(({ resource, action }) =>
      hasPermission(user, resource, action)
    );

    if (!hasAllPermissions) {
      return fallback ?? <AccessDeniedPage />;
    }
  }

  return <>{children}</>;
}

// 접근 거부 페이지
function AccessDeniedPage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // 접근 가능한 첫 번째 라우트 찾기
  const fallbackRoute = useMemo((): string => {
    if (!user) return '/login';
    const routes = getAccessibleRoutes(user);
    const first: string | undefined = routes[0];
    return first ?? '/login';
  }, [user]);

  useEffect(() => {
    if (user) {
      auditService.log({
        action: 'ACCESS_DENIED',
        resource: location.pathname,
        userId: user.id,
        details: { email: user.email },
      });
    }
  }, [user, location.pathname]);

  const handleNavigate = () => {
    navigate(fallbackRoute, { replace: true });
  };

  const buttonLabel = fallbackRoute === '/login' ? '로그인 페이지로 이동' : '돌아가기';

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-txt-main mb-2">접근 권한이 없습니다</h1>
        <p className="text-txt-muted mb-6">
          이 페이지에 접근할 권한이 없습니다.
          <br />
          필요한 경우 관리자에게 문의하세요.
        </p>
        <button
          type="button"
          onClick={handleNavigate}
          className="btn-base btn-primary inline-flex items-center gap-2"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
