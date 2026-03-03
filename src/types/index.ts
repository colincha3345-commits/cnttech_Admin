// User Types
export type UserStatus = 'active' | 'inactive' | 'locked' | 'pending';
export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  status: UserStatus;
  role: UserRole;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Permission Types
export type PermissionAction = 'read' | 'write' | 'delete' | 'unmask';

export interface Permission {
  id: string;
  userId: string;
  resource: string;
  actions: PermissionAction[];
  createdAt: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: Date;
}

// Dashboard Types
export type DateRangePreset = 'yesterday' | 'today' | 'last7days' | 'lastMonth' | 'custom';

export interface DashboardDateRange {
  preset: DateRangePreset;
  from: Date;
  to: Date;
}

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  yesterday: '어제',
  today: '오늘',
  last7days: '최근 7일',
  lastMonth: '전월',
  custom: '기간 선택',
};

export interface DashboardStats {
  // 오늘 통계
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
  totalStores: number;

  // 전일 통계 (비교용)
  yesterdayOrders: number;
  yesterdayRevenue: number;

  // 변화율
  ordersChange: number;
  revenueChange: number;
}

/** 마케팅 성과 항목 */
export interface MarketingPerformanceItem {
  id: string;
  name: string;
  type: 'banner' | 'event' | 'detail_page';
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  trafficSource: string;
  avgDwellTime: number;
}

/** 마케팅 성과 통계 */
export interface MarketingStats {
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  avgConversionRate: number;
  items: MarketingPerformanceItem[];
}

/** 대시보드 엑셀 내보내기 데이터 */
export interface DashboardExportData {
  stats: DashboardStats;
  dailySales: { date: string; revenue: number; orders: number; avgOrderAmount: number }[];
  marketing: MarketingPerformanceItem[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Component Props Types
export type ButtonVariant = 'fill' | 'outline' | 'solid' | 'text' | 'white' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'unmask';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'critical' | 'info';

export type InputState = 'default' | 'error' | 'success';

// Promotion Common Types
export * from './promotion-common';

// Discount Types
export * from './discount';

// Coupon Types
export * from './coupon';

// Benefit Policy Types
export * from './benefit-policy';

// Member Types
export * from './member';

// App Member Types
export * from './app-member';

// Member Segment Types
export * from './member-segment';

// Campaign Types
export * from './campaign';

// Benefit Campaign Types
export * from './benefit-campaign';

// Export Types
export * from './export';

// Staff Types
export * from './staff';

// Store Types
export * from './store';

// Point Settings Types
export * from './point';

// Order Types
export * from './order';

// Event Types
export * from './event';

// Unified User Types
export * from './unified-user';

// Permission Types
export type { AdminMenu, MenuPermission, AccountPermission, UpdatePermissionRequest, AccessLevel } from './permission';
