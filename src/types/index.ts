// User Types
export type UserStatus = 'active' | 'inactive' | 'locked' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  status: UserStatus;
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
  todayCompletedRevenue: number;   // 주문 완료 금액
  todayCancelledRevenue: number;   // 주문 취소 금액
  totalStores: number;

  // 전일 통계 (비교용)
  yesterdayOrders: number;
  yesterdayRevenue: number;

  // 변화율
  ordersChange: number;
  revenueChange: number;

  // 회원 현황
  totalMembers: number;
  newSignupNormal: number;         // 신규 일반 회원가입
  newSignupSimple: number;         // 신규 간편 회원가입
  withdrawalCount: number;         // 탈퇴 회원

  // 문의 현황 (InquiryStatus: pending | resolved)
  pendingInquiries: number;        // 대기
  resolvedInquiries: number;       // 완료
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

// 일별 매출 데이터
export interface DailySalesItem {
  date: string;
  revenue: number;
  orders: number;
  avgOrderAmount: number;
}

// 회원 분석 데이터
export interface MemberAnalyticsData {
  summary: { total: number; active: number; inactive: number; newSignup: number; withdrawal: number };
  gender: { label: string; value: number; count: number }[];
  age: { range: string; percentage: number; count: number }[];
  membership: { grade: string; count: number; percentage: number }[];
  growth: { newCustomerRate: number; newCustomerChange: number; existingCustomerRate: number; existingRetentionChange: number; monthlyNewAvg: number; monthlyChurnAvg: number };
  topCustomers: { rank: number; name: string; totalOrders: number; totalAmount: number; lastOrder: string; grade: string }[];
  orderFrequency: { label: string; percentage: number; count: number }[];
}

/** 대시보드 엑셀 내보내기 데이터 */
// 주문 상세 분석 항목
export interface OrderDetailItem {
  label: string;
  value: number;  // 비율(%)
  count: number;  // 건수
}

// 주문 상세 분석 (유형별/채널별/결제수단별/회원별)
export interface OrderDetailsData {
  byType: OrderDetailItem[];
  byChannel: OrderDetailItem[];
  byPayment: OrderDetailItem[];
  byMember: OrderDetailItem[];
}

export interface DashboardExportData {
  stats: DashboardStats;
  dailySales: { date: string; revenue: number; orders: number; avgOrderAmount: number }[];
  orderDetails: OrderDetailsData;
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

// Settings Types
export * from './settings';
