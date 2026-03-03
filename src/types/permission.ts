/**
 * 권한관리 도메인 타입 정의
 * 계정별 메뉴 접근 권한 (view / write / masking)
 */

import type { UserRole } from './index';

// 관리 메뉴 타입
export type AdminMenu =
  | 'dashboard'
  | 'menu'
  | 'marketing'
  | 'events'
  | 'orders'
  | 'app-members'
  | 'staff'
  | 'design'
  | 'settlement'
  | 'support'
  | 'audit-logs'
  | 'permissions'
  | 'settings';

// 접근 레벨
export type AccessLevel = 'view' | 'write' | 'masking' | 'download';

// 메뉴별 접근 권한
export interface MenuPermission {
  menu: AdminMenu;
  view: boolean;
  write: boolean;
  masking: boolean;
  download: boolean;
}

// 계정별 권한 정보
export interface AccountPermission {
  accountId: string;
  accountNo: number;
  accountName: string;
  accountEmail: string;
  department: string;
  role: UserRole;
  status: 'active' | 'inactive';
  permissions: MenuPermission[];
  updatedAt: string;
  updatedBy: string;
}

// 권한 수정 요청
export interface UpdatePermissionRequest {
  accountId: string;
  permissions: MenuPermission[];
}

// 하위 권한 설정 항목
export interface SubPermissionConfig {
  level: AccessLevel;
  label: string;
}

// 메뉴별 권한 설정 구조
export interface MenuPermissionConfig {
  menu: AdminMenu;
  label: string;
  subPermissions: SubPermissionConfig[];
}

// 메뉴 라벨
export const ADMIN_MENU_LABELS: Record<AdminMenu, string> = {
  dashboard: '대시보드',
  menu: '메뉴관리',
  marketing: '마케팅관리',
  events: '이벤트관리',
  orders: '주문관리',
  'app-members': '앱회원관리',
  staff: '본사/가맹계정',
  design: '디자인관리',
  settlement: '정산관리',
  support: '고객센터',
  'audit-logs': '감사 로그',
  permissions: '권한 관리',
  settings: '설정',
};

// 메뉴 순서
export const ADMIN_MENU_ORDER: AdminMenu[] = [
  'dashboard',
  'menu',
  'marketing',
  'events',
  'orders',
  'app-members',
  'staff',
  'design',
  'settlement',
  'support',
  'audit-logs',
  'permissions',
  'settings',
];

// 접근 레벨 라벨
export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  view: '조회',
  write: '편집',
  masking: '개인정보 마스킹 여부',
  download: '내역 다운로드',
};

// 메뉴별 하위 권한 설정
export const MENU_PERMISSION_CONFIG: MenuPermissionConfig[] = [
  {
    menu: 'dashboard',
    label: '대시보드',
    subPermissions: [
      { level: 'view', label: '대시보드 조회' },
    ],
  },
  {
    menu: 'menu',
    label: '메뉴관리',
    subPermissions: [
      { level: 'view', label: '메뉴 관리' },
      { level: 'write', label: '메뉴 등록' },
    ],
  },
  {
    menu: 'marketing',
    label: '마케팅관리',
    subPermissions: [
      { level: 'view', label: '마케팅 조회' },
      { level: 'write', label: '마케팅 등록' },
    ],
  },
  {
    menu: 'events',
    label: '이벤트관리',
    subPermissions: [
      { level: 'view', label: '이벤트 조회' },
      { level: 'write', label: '이벤트 관리' },
    ],
  },
  {
    menu: 'orders',
    label: '주문관리',
    subPermissions: [
      { level: 'view', label: '주문 조회' },
      { level: 'write', label: '주문 관리' },
      { level: 'masking', label: '개인정보 마스킹 여부' },
      { level: 'download', label: '내역 다운로드' },
    ],
  },
  {
    menu: 'app-members',
    label: '앱회원관리',
    subPermissions: [
      { level: 'view', label: '회원 조회' },
      { level: 'write', label: '회원 관리' },
      { level: 'masking', label: '개인정보 마스킹 여부' },
      { level: 'download', label: '내역 다운로드' },
    ],
  },
  {
    menu: 'staff',
    label: '본사/가맹계정',
    subPermissions: [
      { level: 'view', label: '계정 조회' },
      { level: 'write', label: '계정 등록' },
      { level: 'masking', label: '개인정보 마스킹 여부' },
      { level: 'download', label: '내역 다운로드' },
    ],
  },
  {
    menu: 'design',
    label: '디자인관리',
    subPermissions: [
      { level: 'view', label: '디자인 조회' },
      { level: 'write', label: '디자인 편집' },
    ],
  },
  {
    menu: 'settlement',
    label: '정산관리',
    subPermissions: [
      { level: 'view', label: '정산 조회' },
      { level: 'write', label: '정산 처리' },
    ],
  },
  {
    menu: 'support',
    label: '고객센터',
    subPermissions: [
      { level: 'view', label: '문의 조회' },
      { level: 'write', label: '답변 작성' },
    ],
  },
  {
    menu: 'audit-logs',
    label: '감사 로그',
    subPermissions: [
      { level: 'view', label: '로그 조회' },
      { level: 'download', label: '내역 다운로드' },
    ],
  },
  {
    menu: 'permissions',
    label: '권한 관리',
    subPermissions: [
      { level: 'view', label: '권한 조회' },
      { level: 'write', label: '권한 설정' },
    ],
  },
  {
    menu: 'settings',
    label: '설정',
    subPermissions: [
      { level: 'view', label: '설정 조회' },
      { level: 'write', label: '설정 변경' },
    ],
  },
];

// admin 기본 권한 (전체 허용)
export const ADMIN_DEFAULT_PERMISSIONS: MenuPermission[] = ADMIN_MENU_ORDER.map((menu) => ({
  menu,
  view: true,
  write: true,
  masking: true,
  download: true,
}));
