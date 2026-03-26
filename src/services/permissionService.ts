/**
 * 권한관리 서비스 레이어
 * UI Components → Hooks → Service → Mock Data
 * [2026-03-23] 감사 로그 추가: 권한 변경/초기화 시 전/후 스냅샷 기록
 */

import type { AccountPermission, UpdatePermissionRequest } from '@/types/permission';
import { mockAccountPermissions } from '@/lib/api/mockPermissionData';
import { delay } from '@/utils/async';
import { auditService } from '@/services/auditService';

// Mock 데이터 로컬 복사
let accountPermissions: AccountPermission[] = [...mockAccountPermissions];

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


  const previousPermissions = existing.permissions;

  const updated: AccountPermission = {
    ...existing,
    permissions: request.permissions,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  accountPermissions = accountPermissions.map((a) =>
    a.accountId === request.accountId ? updated : a,
  );

  // 감사 로그: 권한 변경 전/후 스냅샷 기록
  auditService.log({
    action: 'PERMISSION_CHANGED',
    resource: 'permission',
    userId: updatedBy,
    details: {
      targetAccountId: request.accountId,
      accountName: existing.accountName,
      before: previousPermissions,
      after: request.permissions,
    },
  });

  return updated;
}

/**
 * 계정 권한 초기화 (초대 시 기본값으로)
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


  // mock 원본에서 기본 권한 복원
  const defaultPermissions =
    mockAccountPermissions.find((a) => a.accountId === accountId)?.permissions ?? [];

  const previousPermissions = existing.permissions;

  const reset: AccountPermission = {
    ...existing,
    permissions: defaultPermissions,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  accountPermissions = accountPermissions.map((a) =>
    a.accountId === accountId ? reset : a,
  );

  // 감사 로그: 권한 초기화 전/후 스냅샷 기록
  auditService.log({
    action: 'PERMISSION_CHANGED',
    resource: 'permission',
    userId: updatedBy,
    details: {
      targetAccountId: accountId,
      accountName: existing.accountName,
      before: previousPermissions,
      after: defaultPermissions,
    },
  });

  return reset;
}

export const permissionService = {
  getAccountPermissions,
  getAccountPermissionById,
  updateAccountPermission,
  resetAccountPermission,
};
