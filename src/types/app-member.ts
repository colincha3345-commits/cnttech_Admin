/**
 * 앱회원관리 관련 타입 정의
 */
import type { DiscountMethod } from './promotion-common';

// ============================================
// 앱 사용 로그
// ============================================

/**
 * 앱 액션 타입
 */
export type AppAction =
  | 'login'
  | 'logout'
  | 'view_product'
  | 'add_cart'
  | 'order'
  | 'cancel_order'
  | 'coupon_download'
  | 'point_use'
  | 'review_write'
  | 'inquiry';

export const APP_ACTION_LABELS: Record<AppAction, string> = {
  login: '로그인',
  logout: '로그아웃',
  view_product: '상품 조회',
  add_cart: '장바구니 추가',
  order: '주문',
  cancel_order: '주문 취소',
  coupon_download: '쿠폰 다운로드',
  point_use: '포인트 사용',
  review_write: '리뷰 작성',
  inquiry: '문의',
};

/**
 * 기기 정보
 */
export interface DeviceInfo {
  os: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
  deviceModel: string;
}

export const DEVICE_OS_LABELS: Record<DeviceInfo['os'], string> = {
  ios: 'iOS',
  android: 'Android',
  web: '웹',
};

/**
 * 앱 사용 로그
 */
export interface AppUsageLog {
  id: string;
  memberId: string;
  action: AppAction;
  detail: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  createdAt: Date;
}

// ============================================
// 주문 내역
// ============================================

/**
 * 주문 상태
 */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '결제 대기',
  confirmed: '주문 확인',
  preparing: '준비 중',
  ready: '준비 완료',
  delivered: '배달 완료',
  completed: '완료',
  cancelled: '취소됨',
};

/**
 * 회원 주문 유형
 */
export type MemberOrderType = 'delivery' | 'pickup';

export const MEMBER_ORDER_TYPE_LABELS: Record<MemberOrderType, string> = {
  delivery: '배달',
  pickup: '포장',
};

/**
 * 주문 상품 항목
 */
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  options: string[];
}

/**
 * 회원 주문 내역
 */
export interface MemberOrder {
  id: string;
  memberId: string;
  orderNumber: string;
  orderDate: Date;
  orderType: MemberOrderType;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  storeId: string;
  storeName: string;
}

// ============================================
// 포인트 이력
// ============================================

/**
 * 포인트 타입
 */
export type PointType =
  | 'earn_order'        // 주문확정 적립
  | 'earn_event'        // 이벤트 적립
  | 'earn_manual'       // 수동 지급
  | 'use_order'         // 주문 사용
  | 'withdraw_manual'   // 수동 회수
  | 'withdraw_cancel'   // 주문취소 회수 (마이너스 잔고 발생 가능)
  | 'expired';          // 만료

export const POINT_TYPE_LABELS: Record<PointType, string> = {
  earn_order: '적립완료',
  earn_event: '이벤트 적립',
  earn_manual: '수동 지급',
  use_order: '주문 사용',
  withdraw_manual: '수동 회수',
  withdraw_cancel: '주문취소 회수',
  expired: '기간 만료',
};

/**
 * 포인트 이력
 */
export interface PointHistory {
  id: string;
  memberId: string;
  type: PointType;
  amount: number;           // 양수: 적립, 음수: 사용/회수
  balance: number;          // 잔여 포인트
  description: string;
  relatedOrderId?: string;
  adminId?: string;         // 수동 지급/회수 시 관리자 ID
  adminMemo?: string;       // 수동 지급/회수 사유
  createdAt: Date;
  expiresAt?: Date;         // 만료일
}

/**
 * 포인트 요약
 */
export interface PointSummary {
  currentBalance: number;   // 현재 잔액
  totalEarned: number;      // 총 적립
  totalUsed: number;        // 총 사용
  expiringSoon: number;     // 30일 내 만료 예정
}

/**
 * 포인트 수동 조정 요청
 */
export interface PointAdjustRequest {
  memberId: string;
  type: 'earn_manual' | 'withdraw_manual';
  amount: number;
  reason: string;
}

// ============================================
// 쿠폰 이력
// ============================================

/**
 * 회원 쿠폰 상태
 */
export type MemberCouponStatus = 'available' | 'used' | 'expired' | 'withdrawn';

export const MEMBER_COUPON_STATUS_LABELS: Record<MemberCouponStatus, string> = {
  available: '사용 가능',
  used: '사용 완료',
  expired: '만료',
  withdrawn: '회수됨',
};

/**
 * 회원별 쿠폰 이력
 */
export interface MemberCoupon {
  id: string;
  memberId: string;
  couponId: string;
  couponName: string;
  discountType: DiscountMethod;
  discountValue: number;
  status: MemberCouponStatus;
  issuedAt: Date;
  usedAt?: Date;
  usedOrderId?: string;
  expiresAt: Date;
  adminId?: string;         // 수동 지급 시
  adminMemo?: string;
}

/**
 * 쿠폰 요약
 */
export interface CouponSummary {
  availableCount: number;   // 사용 가능
  usedCount: number;        // 사용 완료
  expiredCount: number;     // 만료
}

/**
 * 쿠폰 수동 조정 요청
 */
export interface CouponAdjustRequest {
  memberId: string;
  couponId: string;
  type: 'issue' | 'withdraw';
  reason: string;
}

// ============================================
// 교환권 이력
// ============================================

/**
 * 교환권 타입
 */
export type VoucherType = 'gifticon' | 'mobile_voucher' | 'brand_voucher';

export const VOUCHER_TYPE_LABELS: Record<VoucherType, string> = {
  gifticon: '기프티콘',
  mobile_voucher: '모바일 상품권',
  brand_voucher: '브랜드 교환권',
};

/**
 * 교환권 상태
 */
export type VoucherStatus = 'registered' | 'used' | 'expired';

export const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  registered: '등록됨',
  used: '사용 완료',
  expired: '만료',
};

/**
 * 회원 교환권 이력
 */
export interface MemberVoucher {
  id: string;
  memberId: string;
  voucherType: VoucherType;
  voucherCode: string;
  voucherName: string;
  productId?: string;
  productName?: string;
  status: VoucherStatus;
  registeredAt: Date;
  usedAt?: Date;
  usedOrderId?: string;
  expiresAt: Date;
}

// ============================================
// 알림 발송 이력
// ============================================

/**
 * 알림 유형
 */
export type NotificationType = 'order' | 'promotion' | 'point' | 'coupon' | 'system';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  order: '주문 알림',
  promotion: '프로모션',
  point: '포인트',
  coupon: '쿠폰',
  system: '시스템',
};

/**
 * 알림 채널
 */
export type NotificationChannel = 'push' | 'sms' | 'email' | 'kakao';

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  push: '푸시',
  sms: 'SMS',
  email: '이메일',
  kakao: '카카오톡',
};

/**
 * 알림 상태
 */
export type NotificationStatus = 'sent' | 'delivered' | 'read' | 'failed';

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  sent: '발송',
  delivered: '전달됨',
  read: '읽음',
  failed: '실패',
};

/**
 * 회원 알림 발송 이력
 */
export interface MemberNotification {
  id: string;
  memberId: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  title: string;
  content: string;
  status: NotificationStatus;
  sentAt: Date;
  readAt?: Date;
  campaignId?: string;
  campaignName?: string;
}

// ============================================
// 회원 목록 필터
// ============================================

/**
 * 회원 목록 필터 타입
 */
export type MemberListFilter = 'all' | 'inactive_30days' | 'inactive_90days' | 'no_order';

export const MEMBER_LIST_FILTER_LABELS: Record<MemberListFilter, string> = {
  all: '전체회원',
  inactive_30days: '30일이상 미접속',
  inactive_90days: '3개월이상 미접속',
  no_order: '미주문회원',
};

/**
 * 회원 상세 탭
 */
export type MemberDetailTab =
  | 'info'
  | 'orders'
  | 'points'
  | 'coupons'
  | 'vouchers';

export const MEMBER_DETAIL_TAB_LABELS: Record<MemberDetailTab, string> = {
  info: '기본정보',
  orders: '주문 내역',
  points: '포인트',
  coupons: '쿠폰',
  vouchers: '교환권',
};
