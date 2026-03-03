/**
 * 프로모션(할인/쿠폰) 공통 타입 정의
 *
 * 할인(discount)과 쿠폰(coupon)에서 중복되는 개념을 통합한 파일.
 * 각 도메인 타입 파일(discount.ts, coupon.ts 등)에서 import하여 사용한다.
 */

// ============================================
// 할인 방식
// ============================================

/** 할인 방식: 정률(%) 또는 정액(원) */
export type DiscountMethod = 'percentage' | 'fixed';

export const DISCOUNT_METHOD_LABELS: Record<DiscountMethod, string> = {
  percentage: '정률 할인 (%)',
  fixed: '정액 할인 (원)',
};

// ============================================
// 프로모션 주문 유형 필터
// ============================================

/**
 * 프로모션 적용 대상 주문 유형
 *
 * 주의: 실제 주문 유형(OrderDeliveryType)과 다름.
 * 이 타입은 할인/쿠폰의 "적용 대상 주문유형 필터"용이다.
 */
export type PromotionOrderType = 'all' | 'delivery' | 'pickup';

export const PROMOTION_ORDER_TYPE_LABELS: Record<PromotionOrderType, string> = {
  all: '전체',
  delivery: '배달',
  pickup: '포장',
};

// ============================================
// 시간대
// ============================================

/** 시간대 설정 (HH:mm 형식) */
export interface TimeSlot {
  startTime: string;
  endTime: string;
}

// ============================================
// 요일
// ============================================

/** 요일 (0: 일요일 ~ 6: 토요일) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: '일',
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
  6: '토',
};
