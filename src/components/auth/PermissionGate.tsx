import { useAuthStore } from '@/stores/authStore';
import type { PermissionAction } from '@/types';
import type { Resource } from '@/types/rbac';
import { hasPermission } from '@/utils/permissionChecker';

interface PermissionGateProps {
  resource: Resource;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 권한이 있는 경우에만 children을 렌더링하는 컴포넌트
 * 권한이 없으면 fallback을 렌더링하거나 아무것도 렌더링하지 않음
 */
export function PermissionGate({
  resource,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { user } = useAuthStore();

  if (!user || !hasPermission(user, resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface MultiPermissionGateProps {
  permissions: { resource: Resource; action: PermissionAction }[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 여러 권한을 확인하는 컴포넌트
 * requireAll이 true면 모든 권한 필요, false면 하나만 있어도 됨
 */
export function MultiPermissionGate({
  permissions,
  requireAll = true,
  children,
  fallback = null,
}: MultiPermissionGateProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <>{fallback}</>;
  }

  const hasRequiredPermissions = requireAll
    ? permissions.every(({ resource, action }) => hasPermission(user, resource, action))
    : permissions.some(({ resource, action }) => hasPermission(user, resource, action));

  if (!hasRequiredPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
