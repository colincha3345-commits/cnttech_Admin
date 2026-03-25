import type { UserRole, PermissionAction } from './index';
import type { AdminMenu } from './permission';

// 리소스 = AdminMenu와 동일 (정합성 유지)
export type Resource = AdminMenu;

// 역할별 권한 매트릭스 타입
export type RolePermissionMatrix = {
  [role in UserRole]: {
    [resource in Resource]?: PermissionAction[];
  };
};

// 역할별 기본 권한
export const ROLE_PERMISSIONS: RolePermissionMatrix = {
  admin: {
    dashboard: ['read', 'write'],
    menu: ['read', 'write'],
    marketing: ['read', 'write'],
    push: ['read', 'write'],
    events: ['read', 'write', 'unmask'],
    orders: ['read', 'write', 'unmask'],
    'app-members': ['read', 'write', 'unmask'],
    staff: ['read', 'write', 'delete'],
    design: ['read', 'write'],
    settlement: ['read', 'write'],
    support: ['read', 'write'],
    'delivery-zones': ['read', 'write'],
    'audit-logs': ['read'],
    permissions: ['read', 'write'],
    settings: ['read', 'write'],
  },
  manager: {
    dashboard: ['read'],
    menu: ['read', 'write'],
    marketing: ['read', 'write'],
    push: ['read', 'write'],
    events: ['read', 'write'],
    orders: ['read', 'write'],
    'app-members': ['read', 'write'],
    staff: ['read'],
    design: ['read', 'write'],
    settlement: ['read'],
    support: ['read', 'write'],
    'delivery-zones': ['read', 'write'],
    'audit-logs': ['read'],
    permissions: ['read'],
    settings: ['read'],
  },
  viewer: {
    dashboard: ['read'],
    menu: ['read'],
    marketing: ['read'],
    push: ['read'],
    events: ['read'],
    orders: ['read'],
    'app-members': ['read'],
    design: ['read'],
    support: ['read'],
    'delivery-zones': ['read'],
    permissions: ['read'],
  },
};

// 라우트별 필요 권한 매핑
export const ROUTE_PERMISSIONS: Record<string, { resource: Resource; action: PermissionAction }> = {
  // 대시보드
  '/dashboard': { resource: 'dashboard', action: 'read' },
  '/dashboard/ga4': { resource: 'dashboard', action: 'read' },
  '/dashboard/ga4/device': { resource: 'dashboard', action: 'read' },
  '/dashboard/ga4/funnel': { resource: 'dashboard', action: 'read' },
  // 메뉴관리
  '/menu/categories': { resource: 'menu', action: 'read' },
  '/menu/products': { resource: 'menu', action: 'read' },
  '/menu/options': { resource: 'menu', action: 'read' },
  '/menu/option-groups': { resource: 'menu', action: 'read' },
  // 마케팅관리
  '/marketing/discounts': { resource: 'marketing', action: 'read' },
  '/marketing/coupons': { resource: 'marketing', action: 'read' },
  '/marketing/campaigns': { resource: 'marketing', action: 'read' },
  '/marketing/points': { resource: 'marketing', action: 'read' },
  '/marketing/push': { resource: 'push', action: 'read' },
  // 이벤트관리
  '/events': { resource: 'events', action: 'read' },
  // 주문관리
  '/orders': { resource: 'orders', action: 'read' },
  // 앱회원관리
  '/app-members': { resource: 'app-members', action: 'read' },
  '/app-members/inactive': { resource: 'app-members', action: 'read' },
  '/app-members/no-order': { resource: 'app-members', action: 'read' },
  '/app-members/extract': { resource: 'app-members', action: 'read' },
  '/app-members/groups': { resource: 'app-members', action: 'read' },
  '/app-members/grades': { resource: 'app-members', action: 'read' },
  // 본사/가맹계정
  '/staff/headquarters': { resource: 'staff', action: 'read' },
  '/staff/franchise': { resource: 'staff', action: 'read' },
  '/staff/approvals': { resource: 'staff', action: 'write' },
  '/staff/teams': { resource: 'staff', action: 'read' },
  '/staff/stores': { resource: 'staff', action: 'read' },
  // 디자인관리
  '/design/banners': { resource: 'design', action: 'read' },
  '/design/popups': { resource: 'design', action: 'read' },
  '/design/icon-badges': { resource: 'design', action: 'read' },
  '/design/main-screen': { resource: 'design', action: 'read' },
  // 고객센터
  '/support/inquiries': { resource: 'support', action: 'read' },
  '/support/franchise-inquiries': { resource: 'support', action: 'read' },
  '/support/faq': { resource: 'support', action: 'read' },
  // 정산관리
  '/settlement': { resource: 'settlement', action: 'read' },
  '/settlement/stats': { resource: 'settlement', action: 'read' },
  // 상권관리
  '/delivery-zones': { resource: 'delivery-zones', action: 'read' },
  // 감사로그
  '/audit-logs': { resource: 'audit-logs', action: 'read' },
  // 권한관리
  '/permissions': { resource: 'permissions', action: 'read' },
  // 설정
  '/settings': { resource: 'settings', action: 'read' },
};

// 역할 표시 이름
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: '관리자',
  manager: '매니저',
  viewer: '뷰어',
};

// 역할 설명
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: '모든 기능에 대한 전체 접근 권한',
  manager: '사용자 관리 및 보고서 열람 권한',
  viewer: '대시보드 및 보고서 열람 권한',
};
