import type { AuthUser } from '@/types/auth';
import type { PermissionAction } from '@/types/index';
import type { Resource } from '@/types/rbac';
import { ROUTE_PERMISSIONS as RoutePermissions } from '@/types/rbac';

/**
 * 사용자가 특정 리소스에 대한 특정 액션 권한이 있는지 확인
 * 메뉴별 권한(permissions) 기반으로만 판단한다.
 */
export function hasPermission(
  user: AuthUser,
  resource: Resource,
  action: PermissionAction
): boolean {
  const userPermission = user.permissions.find((p) => p.resource === resource);
  if (userPermission?.actions.includes(action)) {
    return true;
  }

  return false;
}

/**
 * 사용자가 특정 라우트에 접근할 수 있는지 확인
 */
export function canAccessRoute(user: AuthUser, pathname: string): boolean {
  const permission = RoutePermissions[pathname];

  if (!permission) {
    // 정의되지 않은 라우트는 기본적으로 접근 허용
    return true;
  }

  return hasPermission(user, permission.resource, permission.action);
}

/**
 * 사용자의 모든 권한 목록 반환
 */
export function getUserPermissions(user: AuthUser): Map<Resource, PermissionAction[]> {
  const permissions = new Map<Resource, PermissionAction[]>();

  user.permissions.forEach((perm) => {
    const existing = permissions.get(perm.resource as Resource) || [];
    const merged = [...new Set([...existing, ...perm.actions])];
    permissions.set(perm.resource as Resource, merged);
  });

  return permissions;
}

/**
 * 사용자가 접근 가능한 라우트 목록 반환
 */
export function getAccessibleRoutes(user: AuthUser): string[] {
  return Object.entries(RoutePermissions)
    .filter(([, permission]) => hasPermission(user, permission.resource, permission.action))
    .map(([route]) => route);
}
