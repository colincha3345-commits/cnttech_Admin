// 할인 관리 타입 정의

import type { DiscountMethod, PromotionOrderType, TimeSlot, DayOfWeek } from './promotion-common';
import { PROMOTION_ORDER_TYPE_LABELS } from './promotion-common';

// 공통 타입 re-export (하위 호환)
export type { DiscountMethod, TimeSlot, DayOfWeek, PromotionOrderType } from './promotion-common';
export { DISCOUNT_METHOD_LABELS, DAY_LABELS, PROMOTION_ORDER_TYPE_LABELS } from './promotion-common';

/** @deprecated PromotionOrderType 사용 권장 */
export type OrderType = PromotionOrderType;

/** @deprecated PROMOTION_ORDER_TYPE_LABELS 사용 권장 */
export const ORDER_TYPE_LABELS = PROMOTION_ORDER_TYPE_LABELS;

/**
 * 할인 유형
 * - company: 자사할인 (% / 금액 할인)
 * - gift: 증정할인 (상품 증정)
 */
export type DiscountType = 'company' | 'gift';

/**
 * 할인 유형 라벨
 */
export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  company: '자사할인',
  gift: '증정할인',
};

/**
 * 증정 조건 타입
 * - product_purchase: 특정 상품 구매 시
 * - n_plus_one: N+1 (N개 구매 시 1개 증정)
 * - min_order: 최소 주문 금액 충족 시
 */
export type GiftConditionType = 'product_purchase' | 'n_plus_one' | 'min_order';

/**
 * 증정 조건 라벨
 */
export const GIFT_CONDITION_LABELS: Record<GiftConditionType, string> = {
  product_purchase: '특정 상품 구매 시',
  n_plus_one: 'N+1 증정',
  min_order: '최소 주문 금액 충족 시',
};

/**
 * 증정 조건 설정
 */
export interface GiftCondition {
  type: GiftConditionType;
  // product_purchase: 구매해야 할 상품
  purchaseProductIds?: string[];
  purchaseQuantity?: number; // 구매 수량 조건
  // n_plus_one: N개 구매 시 1개 증정
  buyQuantity?: number; // N (구매 수량)
  getQuantity?: number; // 증정 수량 (기본 1)
  // min_order: 최소 주문 금액
  minAmount?: number;
}

/**
 * 증정 상품 설정
 */
export interface GiftReward {
  productIds: string[]; // 증정할 상품 ID 목록
  quantity: number; // 증정 수량
  maxPerOrder?: number; // 주문당 최대 증정 횟수
}

/** @deprecated 기간+요일/시간 통합으로 더 이상 사용하지 않음 */
export type DiscountPeriodType = 'period' | 'schedule';

/**
 * 스케줄 설정 (적용 요일/시간)
 */
export interface DiscountSchedule {
  days: DayOfWeek[]; // 적용 요일
  timeSlots: TimeSlot[]; // 적용 시간대
}

/**
 * 적용 상품 범위
 * - all: 전체 상품
 * - category: 특정 카테고리
 * - product: 특정 상품
 */
export type DiscountTargetType = 'all' | 'category' | 'product';

/**
 * 사용 채널
 * - all: 전체
 * - app: APP
 * - pc_web: PC웹
 * - mobile_web: 모바일웹
 */
export type DiscountChannel = 'all' | 'app' | 'pc_web' | 'mobile_web';

/**
 * 채널 라벨
 */
export const CHANNEL_LABELS: Record<DiscountChannel, string> = {
  all: '전체',
  app: 'APP',
  pc_web: 'PC웹',
  mobile_web: '모바일웹',
};

/**
 * 할인 금액 반올림 단위
 */
export type RoundingUnit = 1 | 10 | 100;

/**
 * 할인 금액 반올림 방식
 * - round: 반올림
 * - ceil: 올림
 * - floor: 내림 (버림)
 */
export type RoundingType = 'round' | 'ceil' | 'floor';

/**
 * 할인 금액 단위 설정
 */
export interface RoundingSetting {
  enabled: boolean; // 단위설정 활성화 여부
  unit: RoundingUnit; // 단위 (1원, 10원, 100원)
  type: RoundingType; // 반올림/올림/내림
}

/**
 * 적용 대상 설정
 */
export interface DiscountTarget {
  type: DiscountTargetType;
  categoryIds?: string[]; // type이 'category'일 때
  productIds?: string[]; // type이 'product'일 때
}

/**
 * 할인 정책
 */
export interface Discount {
  id: string;
  name: string; // 할인명
  discountType: DiscountType; // 할인 유형 (자사할인/증정할인)
  method: DiscountMethod; // 할인 방식 (% / 금액)
  value: number; // 할인값 (10 = 10% 또는 10원) - discountType이 'company'일 때

  // 증정 설정 - discountType이 'gift'일 때
  giftCondition?: GiftCondition; // 증정 조건
  giftReward?: GiftReward; // 증정 상품

  // 기간 설정
  periodType: DiscountPeriodType; // @deprecated 하위 호환용
  startDate?: string;
  endDate?: string;
  schedule?: DiscountSchedule; // 적용 요일/시간

  // 적용 대상
  target: DiscountTarget;

  // 참여 매장 설정
  applyToAll: boolean; // 전체 매장 적용 여부
  storeIds: string[]; // 적용 매장 ID 목록 (applyToAll이 false일 때)

  // 사용 채널 및 주문 유형
  channel: DiscountChannel; // 사용 채널
  orderType: PromotionOrderType; // 주문 유형

  // 제한 설정
  minOrderAmount?: number; // 최소 주문 금액
  maxDiscountAmount?: number; // 최대 할인 금액 (% 할인 시)

  // 금액 단위 설정 (반올림/올림/내림)
  rounding?: RoundingSetting;

  // 정산 비율
  headquartersRatio: number;
  franchiseRatio: number;

  // 상태
  isActive: boolean;
  usageCount: number;

  // 메타
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 할인 생성/수정 폼 데이터
 */
export interface DiscountFormData {
  name: string;
  discountType: DiscountType;
  method: DiscountMethod;
  value: number;

  // 증정 설정 - discountType이 'gift'일 때
  giftCondition?: GiftCondition;
  giftReward?: GiftReward;

  startDate?: string;
  endDate?: string;
  schedule?: DiscountSchedule;

  target: DiscountTarget;

  // 참여 매장 설정
  applyToAll: boolean;
  storeIds: string[];

  // 사용 채널 및 주문 유형
  channel: DiscountChannel;
  orderType: PromotionOrderType;

  minOrderAmount?: number;
  maxDiscountAmount?: number;

  // 금액 단위 설정
  rounding?: RoundingSetting;

  // 정산 비율
  headquartersRatio: number;
  franchiseRatio: number;

  isActive: boolean;
  description?: string;
}

/** 전체 요일 기본값 */
const ALL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

/**
 * 기본 폼 데이터
 */
export const DEFAULT_DISCOUNT_FORM: DiscountFormData = {
  name: '',
  discountType: 'company',
  method: 'percentage',
  value: 0,
  schedule: {
    days: ALL_DAYS,
    timeSlots: [{ startTime: '00:00', endTime: '23:59' }],
  },
  target: { type: 'all' },
  applyToAll: true,
  storeIds: [],
  channel: 'all',
  orderType: 'all',
  headquartersRatio: 0,
  franchiseRatio: 100,
  isActive: true,
};
