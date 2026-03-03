/**
 * 권한관리 서비스 레이어
 * UI Components → Hooks → Service → Mock Data
 */

import type { AccountPermission, UpdatePermissionRequest } from '@/types/permission';
import { mockAccountPermissions } from '@/lib/api/mockPermissionData';
import { delay } from '@/utils/async';

// Mock 데이터 로컬 복사
let accountPermissions: AccountPermission[] = [...mockAccountPermissions];

/** admin 권한 변경 방어 */
function assertNotAdmin(account: AccountPermission): void {
  if (account.role === 'admin') {
    throw new Error('관리자 권한은 변경할 수 없습니다.');
  }
}

/**
 * 전체 계정 권한 목록 조회
 */
async function getAccountPermissions(): Promise<AccountPermission[]> {
  await delay(400);
  return [...accountPermissions];
}

/**
 * 특정 계정 권한 조회
 */
async function getAccountPermissionById(accountId: string): Promise<AccountPermission | null> {
  await delay(300);
  return accountPermissions.find((a) => a.accountId === accountId) ?? null;
}

/**
 * 계정 권한 수정
 * - admin 권한은 수정 불가 (항상 전체 권한)
 */
async function updateAccountPermission(
  request: UpdatePermissionRequest,
  updatedBy: string,
): Promise<AccountPermission> {
  await delay(500);

  const index = accountPermissions.findIndex((a) => a.accountId === request.accountId);
  if (index === -1) {
    throw new Error('계정을 찾을 수 없습니다.');
  }

  const existing = accountPermissions[index]!;
  assertNotAdmin(existing);

  const updated: AccountPermission = {
    ...existing,
    permissions: request.permissions,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  accountPermissions = accountPermissions.map((a) =>
    a.accountId === request.accountId ? updated : a,
  );

  return updated;
}

/**
 * 계정 권한 초기화 (역할 기본값으로)
 */
async function resetAccountPermission(
  accountId: string,
  updatedBy: string,
): Promise<AccountPermission> {
  await delay(400);

  const index = accountPermissions.findIndex((a) => a.accountId === accountId);
  if (index === -1) {
    throw new Error('계정을 찾을 수 없습니다.');
  }

  const existing = accountPermissions[index]!;
  assertNotAdmin(existing);

  // mock 원본에서 기본 권한 복원
  const defaultPermissions =
    mockAccountPermissions.find((a) => a.accountId === accountId)?.permissions ?? [];

  const reset: AccountPermission = {
    ...existing,
    permissions: defaultPermissions,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  accountPermissions = accountPermissions.map((a) =>
    a.accountId === accountId ? reset : a,
  );

  return reset;
}

export const permissionService = {
  getAccountPermissions,
  getAccountPermissionById,
  updateAccountPermission,
  resetAccountPermission,
};
