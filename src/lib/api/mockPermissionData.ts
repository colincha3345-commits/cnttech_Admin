/**
 * 권한관리 Mock 데이터
 * 계정별 메뉴 접근 권한
 */

import type { AccountPermission, AdminMenu } from '@/types/permission';
import { ADMIN_MENU_ORDER } from '@/types/permission';

/** 전체 메뉴에 대해 일괄 권한 생성 헬퍼 */
function createPermissions(
  overrides: Partial<Record<AdminMenu, { view?: boolean; write?: boolean; masking?: boolean; download?: boolean }>> = {},
) {
  return ADMIN_MENU_ORDER.map((menu) => ({
    menu,
    view: overrides[menu]?.view ?? false,
    write: overrides[menu]?.write ?? false,
    masking: overrides[menu]?.masking ?? false,
    download: overrides[menu]?.download ?? false,
  }));
}

export const mockAccountPermissions: AccountPermission[] = [
  {
    accountId: '1',
    accountNo: 101,
    accountName: '김관리',
    accountEmail: 'colin@cntt.co.kr',
    department: '본사운영팀',
    status: 'active',
    // 최고 관리자: 모든 메뉴 전체 권한
    permissions: ADMIN_MENU_ORDER.map((menu) => ({
      menu,
      view: true,
      write: true,
      masking: true,
      download: true,
    })),
    updatedAt: '2026-04-01T09:00:00Z',
    updatedBy: '시스템',
  },
  {
    accountId: '2',
    accountNo: 102,
    accountName: '이정훈',
    accountEmail: 'jlee@cnttech.co.kr',
    department: '서울사업팀',

    status: 'active',
    permissions: createPermissions({
      dashboard: { view: true },
      menu: { view: true, write: true },
      marketing: { view: true, write: true },
      events: { view: true, write: true },
      orders: { view: true, write: true },
      'app-members': { view: true, write: true },
      staff: { view: true },
      'audit-logs': { view: true },
      settings: { view: true },
    }),
    updatedAt: '2026-01-20T14:30:00Z',
    updatedBy: '김관리',
  },
  {
    accountId: '3',
    accountNo: 103,
    accountName: '박서연',
    accountEmail: 'spark@cnttech.co.kr',
    department: '경기사업팀',

    status: 'active',
    permissions: createPermissions({
      dashboard: { view: true },
      menu: { view: true, write: true },
      marketing: { view: true },
      events: { view: true },
      orders: { view: true, write: true, masking: true },
      'app-members': { view: true },
      staff: { view: true },
    }),
    updatedAt: '2026-01-18T11:00:00Z',
    updatedBy: '김관리',
  },
  {
    accountId: '4',
    accountNo: 104,
    accountName: '최민수',
    accountEmail: 'mchoi@cnttech.co.kr',
    department: '부산사업팀',

    status: 'active',
    permissions: createPermissions({
      dashboard: { view: true },
      menu: { view: true },
      marketing: { view: true, write: true },
      events: { view: true, write: true },
      orders: { view: true, write: true },
      'app-members': { view: true, write: true, masking: true },
    }),
    updatedAt: '2026-01-15T16:45:00Z',
    updatedBy: '김관리',
  },
  {
    accountId: '5',
    accountNo: 105,
    accountName: '정유진',
    accountEmail: 'yjung@cnttech.co.kr',
    department: '대구사업팀',

    status: 'active',
    permissions: createPermissions({
      dashboard: { view: true },
      menu: { view: true },
      marketing: { view: true },
      orders: { view: true },
      'app-members': { view: true },
    }),
    updatedAt: '2026-01-10T09:30:00Z',
    updatedBy: '김관리',
  },
  {
    accountId: '6',
    accountNo: 106,
    accountName: '한승우',
    accountEmail: 'swhan@cnttech.co.kr',
    department: '제주사업팀',

    status: 'inactive',
    permissions: createPermissions({
      dashboard: { view: true },
      orders: { view: true },
    }),
    updatedAt: '2026-01-05T13:00:00Z',
    updatedBy: '김관리',
  },
];
