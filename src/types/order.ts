/**
 * 주문관리 관련 타입 정의
 */
import type { OrderStatus } from './app-member';

// ============================================
// 주문 유형 / 채널 / 결제수단
// ============================================

/** 주문 유형 (기존 MemberOrderDeliveryType에 매장식사 추가) */
export type OrderDeliveryType = 'delivery' | 'pickup' | 'dine_in';

export const ORDER_DELIVERY_TYPE_LABELS: Record<OrderDeliveryType, string> = {
  delivery: '배달',
  pickup: '포장',
  dine_in: '매장식사',
};

/** 주문 채널 */
export type OrderChannel = 'app' | 'kiosk' | 'pos' | 'web';

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  app: '앱',
  kiosk: '키오스크',
  pos: 'POS',
  web: '웹',
};

/** 결제수단 */
export type PaymentMethod = 'card' | 'cash' | 'kakao_pay' | 'naver_pay' | 'toss_pay' | 'mobile_gift_card' | 'mobile_voucher' | 'mixed';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: '카드',
  cash: '현금',
  kakao_pay: '카카오페이',
  naver_pay: '네이버페이',
  toss_pay: '토스페이',
  mobile_gift_card: '금액권(모바일상품권)',
  mobile_voucher: '교환권(모바일교환권)',
  mixed: '복합결제',
};

// ============================================
// 현금영수증 / 할인 / 메모
// ============================================

/** 현금영수증 정보 */
export interface CashReceipt {
  requested: boolean;
  type?: 'income_deduction' | 'expense_proof';
  number?: string;
}

export const CASH_RECEIPT_TYPE_LABELS: Record<string, string> = {
  income_deduction: '소득공제',
  expense_proof: '지출증빙',
};

// ============================================
// E쿠폰
// ============================================

/** E쿠폰 유형 */
export type ECouponType = 'voucher' | 'exchange';

export const E_COUPON_TYPE_LABELS: Record<ECouponType, string> = {
  voucher: 'E쿠폰 금액권',
  exchange: 'E쿠폰 교환권',
};

/** E쿠폰 사용 내역 */
export interface ECouponUsage {
  eCouponId: string;
  eCouponName: string;
  eCouponType: ECouponType;
  amount: number;
  productId?: string;
  productName?: string;
  couponCompany: string;
  pinNumber: string;
}

/** 쿠폰/포인트 사용 정보 */
export interface OrderDiscount {
  couponId?: string;
  couponName?: string;
  couponAmount: number;
  pointUsed: number;
  discountAmount: number;
  productDiscount?: number;
  affiliateDiscount?: number;
  eCouponDiscount?: number;
  /** E쿠폰 사용 상세 (금액권/교환권 분리) */
  eCoupons?: ECouponUsage[];

  /** 쿠폰 할인 취소 여부 */
  couponCancelled?: boolean;
  couponCancelledAt?: Date;
  couponCancelledBy?: string;
  /** 제휴할인 취소 여부 */
  affiliateDiscountCancelled?: boolean;
  affiliateDiscountCancelledAt?: Date;
  affiliateDiscountCancelledBy?: string;
}

/** 주문 메모 */
export interface OrderMemo {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

// ============================================
// 주문 취소
// ============================================

/** 취소 사유 타입 */
export type CancelReasonType = 'customer_request' | 'out_of_stock' | 'store_closed' | 'other';

export const CANCEL_REASON_LABELS: Record<CancelReasonType, string> = {
  customer_request: '고객 요청',
  out_of_stock: '재료 소진',
  store_closed: '매장 마감',
  other: '기타',
};

/** 주문 취소 정보 */
export interface OrderCancelInfo {
  reason: CancelReasonType;
  reasonDetail?: string;
  cancelledBy: string;
  cancelledAt: Date;
}

// ============================================
// 복합결제 (개별 결제수단)
// ============================================

/** 개별 결제수단 상태 */
export type PaymentItemStatus = 'paid' | 'cancelled';

export const PAYMENT_ITEM_STATUS_LABELS: Record<PaymentItemStatus, string> = {
  paid: '결제완료',
  cancelled: '취소완료',
};

/** 개별 결제수단 취소 정보 */
export interface PaymentItemCancelInfo {
  reason: CancelReasonType;
  reasonDetail?: string;
  cancelledBy: string;
  cancelledAt: Date;
}

/** 개별 결제수단 정보 */
export interface OrderPaymentItem {
  id: string;
  method: PaymentMethod | ECouponType;
  label: string;
  amount: number;
  status: PaymentItemStatus;
  cancelInfo?: PaymentItemCancelInfo;
  eCouponId?: string;
  eCouponName?: string;
  productName?: string;
  couponCompany?: string;
  pinNumber?: string;
}

/** 개별 결제수단 취소 요청 */
export interface PaymentItemCancelRequest {
  paymentItemId: string;
  reason: CancelReasonType;
  reasonDetail?: string;
}

// ============================================
// 주문 아이템 / 주문
// ============================================

/** 주문 메뉴 아이템 (카테고리 포함) */
export interface OrderMenuItem {
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options: { name: string; price: number }[];
}

/** 주문 메인 인터페이스 */
export interface Order {
  id: string;
  orderNumber: string;
  orderType: OrderDeliveryType;
  channel: OrderChannel;
  status: OrderStatus;
  orderDate: Date;

  // 주문자
  memberId: string;
  memberName: string;
  memberPhone: string;

  // 가맹점
  storeId: string;
  storeName: string;

  // 메뉴
  items: OrderMenuItem[];

  // 금액
  subtotalAmount: number;
  discount: OrderDiscount;
  deliveryFee: number;
  totalAmount: number;

  // 결제
  paymentMethod: PaymentMethod;
  cashReceipt: CashReceipt;
  /** 복합결제 상세 (없으면 단일결제) */
  payments?: OrderPaymentItem[];

  // 배달 주소 (배달 주문 시)
  deliveryAddress?: string;

  // 부가 정보
  memos: OrderMemo[];
  cancelInfo?: OrderCancelInfo;
  customerRequest?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 조회 / 통계 / 요청
// ============================================

/** 주문 조회 필터 */
export interface OrderSearchFilter {
  dateFrom?: Date;
  dateTo?: Date;
  orderType?: OrderDeliveryType;
  status?: OrderStatus;
  storeId?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

/** 주문 통계 */
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedToday: number;
  cancelledToday: number;
  todayRevenue: number;
}

/** 주문 취소 요청 */
export interface OrderCancelRequest {
  reason: CancelReasonType;
  reasonDetail?: string;
}

/** 주문 메모 요청 */
export interface OrderMemoRequest {
  content: string;
}

/** 할인 취소 유형 */
export type DiscountCancelType = 'coupon' | 'affiliate';

/** 엑셀 내보내기 컬럼 */
export interface OrderExportColumn {
  key: string;
  label: string;
  width: number;
  enabled: boolean;
}
