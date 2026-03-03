import type { DiscountMethod, PromotionOrderType, TimeSlot } from './promotion-common';
import { PROMOTION_ORDER_TYPE_LABELS } from './promotion-common';

// 공통 타입 re-export (하위 호환)
export type { DiscountMethod, PromotionOrderType, TimeSlot } from './promotion-common';
export { PROMOTION_ORDER_TYPE_LABELS } from './promotion-common';

/** @deprecated DiscountMethod 사용 권장 */
export type CouponDiscountType = DiscountMethod;

/** @deprecated PromotionOrderType 사용 권장 */
export type CouponOrderType = PromotionOrderType;

/** @deprecated TimeSlot 사용 권장 */
export type TimeRange = TimeSlot;

/** @deprecated PROMOTION_ORDER_TYPE_LABELS 사용 권장 */
export const COUPON_ORDER_TYPE_LABELS = PROMOTION_ORDER_TYPE_LABELS;

/**
 * 쿠폰 상태
 */
export type CouponStatus =
  | 'active'      // 활성
  | 'inactive'    // 비활성
  | 'expired'     // 만료됨
  | 'exhausted';  // 소진됨

/**
 * 쿠폰 적용 범위
 */
export type CouponApplyScope =
  | 'cart_total'       // 장바구니 총 금액
  | 'specific_product' // 특정 상품
  | 'delivery_fee';    // 배달비

/**
 * 적용 범위 라벨
 */
export const COUPON_APPLY_SCOPE_LABELS: Record<CouponApplyScope, string> = {
  cart_total: '장바구니 총 금액',
  specific_product: '특정 상품',
  delivery_fee: '배달비',
};

/**
 * 정산 비율 설정
 */
export interface SettlementRatio {
  headquartersRatio: number;  // 본사 부담 비율 (%)
  franchiseRatio: number;     // 가맹점 부담 비율 (%)
}

/**
 * 사용 가능 스케줄
 */
export interface CouponSchedule {
  availableDays: number[];          // 사용 가능 요일 (0=일, 1=월, ..., 6=토)
  availableTimeRanges: TimeSlot[];  // 사용 가능 시간대
}

/**
 * 가맹점 제한 설정
 */
export interface StoreRestriction {
  type: 'all' | 'include' | 'exclude';  // 전체, 포함, 제외
  storeIds: string[];                    // 대상 가맹점 ID 목록
}

/**
 * 쿠폰 기본 정보 인터페이스
 */
export interface Coupon {
  id: string;
  name: string;
  description: string;
  notice: string;                  // 유의사항

  // 할인 정보
  discountType: DiscountMethod;
  discountValue: number;           // 할인율(%) 또는 할인금액(원)
  minOrderAmount: number;          // 최소 주문 금액
  maxDiscountAmount: number | null; // 최대 할인 금액 (정률 할인 시)

  // 적용 범위
  applyScope: CouponApplyScope;    // 장바구니/특정상품/배달비
  orderType: PromotionOrderType;   // 배달/포장/전체

  // 유효 기간
  startDate: string | null;        // 사용 가능 시작일
  endDate: string | null;          // 사용 가능 종료일
  autoDelete: boolean;             // 만료 시 자동 삭제

  // 사용 제한
  singleUsePerMember: boolean;     // 1인 1회 사용 제한
  totalCount: number | null;       // 총 발행 수량 (null = 무제한)
  usedCount: number;               // 사용된 수량

  // 적용 대상 상품
  applicableProductIds: string[];  // 적용 가능 상품 ID (빈 배열 = 전체)
  applicableCategoryIds: string[]; // 적용 가능 카테고리 ID (빈 배열 = 전체)

  // 사용 가능 스케줄
  schedule: CouponSchedule;        // 요일/시간 제한

  // 가맹점 제한
  storeRestriction: StoreRestriction;

  // 정산 비율
  settlementRatio: SettlementRatio;

  // 상태
  status: CouponStatus;
  isActive: boolean;

  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * 쿠폰 생성/수정 폼 데이터
 */
export interface CouponFormData {
  name: string;
  description: string;
  notice: string;                  // 유의사항
  discountType: DiscountMethod;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;

  // 적용 범위
  applyScope: CouponApplyScope;
  orderType: PromotionOrderType;

  startDate: string;
  endDate: string;
  autoDelete: boolean;
  singleUsePerMember: boolean;
  totalCount: number | null;
  applicableProductIds: string[];
  applicableCategoryIds: string[];

  // 스케줄
  availableDays: number[];
  availableStartTime: string;
  availableEndTime: string;

  // 가맹점 제한
  storeRestrictionType: 'all' | 'include' | 'exclude';
  restrictedStoreIds: string[];

  // 정산 비율
  headquartersRatio: number;
  franchiseRatio: number;
}

/**
 * 기본 폼 데이터
 */
export const DEFAULT_COUPON_FORM: CouponFormData = {
  name: '',
  description: '',
  notice: '',
  discountType: 'fixed',
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscountAmount: null,
  applyScope: 'cart_total',
  orderType: 'all',
  startDate: '',
  endDate: '',
  autoDelete: false,
  singleUsePerMember: true,
  totalCount: null,
  applicableProductIds: [],
  applicableCategoryIds: [],
  availableDays: [0, 1, 2, 3, 4, 5, 6],  // 전체 요일
  availableStartTime: '00:00',
  availableEndTime: '23:59',
  storeRestrictionType: 'all',
  restrictedStoreIds: [],
  headquartersRatio: 100,
  franchiseRatio: 0,
};

/**
 * 쿠폰 유효성 검증
 */
export function validateCouponForm(data: CouponFormData): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('쿠폰명을 입력해주세요.');
  }

  if (data.discountValue <= 0) {
    errors.push('할인 금액/비율을 입력해주세요.');
  }

  if (data.discountType === 'percentage' && data.discountValue > 100) {
    errors.push('할인율은 100%를 초과할 수 없습니다.');
  }

  return errors;
}
